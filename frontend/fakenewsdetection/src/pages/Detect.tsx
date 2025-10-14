import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Tesseract from "tesseract.js";
import { FileText, Link as LinkIcon, Image, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Detect = () => {
  const [activeTab, setActiveTab] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async (inputText = content) => {
    let payload = {};

    if (activeTab === "text") {
      payload = { input: "text", text: inputText, title };
    } else if (activeTab === "url") {
      payload = { input: "url", text: url };
    } else if (activeTab === "image") {
      payload = { input: "text", text: ocrText + "this text has been processed from image by OCR", title: ocrText };
    } else {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://fakenewsclassification.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to fetch analysis");

      const data = await response.json();
      data.prediction = data.label === 1 ? "FAKE" : "REAL";
      data.inputType =
        activeTab === "url" ? "URL" : activeTab === "image" ? "Image" : "Text";

      navigate("/results", { state: { result: data } });
    } catch (err) {
      console.error(err);
      alert("Error analyzing article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 OCR Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setOcrText("");
      setOcrProgress(0);
    }
  };

  const handleOCR = async () => {
    if (!image) {
      alert("Please upload an image first!");
      return;
    }
    setOcrLoading(true);
    setOcrText("");
    setOcrProgress(0);

    try {
      const { data } = await Tesseract.recognize(image, "eng", {
        logger: (info) => {
          if (info.status === "recognizing text") {
            setOcrProgress(Math.round(info.progress * 100));
          }
        },
      });
      setOcrText(data.text.trim());
    } catch (err) {
      console.error("OCR error:", err);
      alert("Failed to extract text from image.");
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Analyze News Article
            </h1>
            <p className="text-muted-foreground">
              Submit an article through text, URL, or image to detect fake news
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Choose Input Method</CardTitle>
              <CardDescription>
                Select how you'd like to submit the news article for analysis
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Text</span>
                  </TabsTrigger>

                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">URL</span>
                  </TabsTrigger>

                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span className="hidden sm:inline">Image</span>
                  </TabsTrigger>
                </TabsList>

                {/* 🧾 Text Tab */}
                <TabsContent value="text" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Article Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter article title..."
                      className="bg-background"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Article Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste article content here..."
                      className="min-h-[200px] bg-background"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleAnalyze(content)}
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {loading ? "Analyzing..." : "Analyze Article"}
                  </Button>
                </TabsContent>

                {/* 🌐 URL Tab */}
                <TabsContent value="url" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="url">Article URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/article"
                      className="bg-background"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleAnalyze(url)}
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {loading ? "Analyzing..." : "Fetch & Analyze"}
                  </Button>
                </TabsContent>

                {/* 🖼️ Image Tab with OCR */}
                <TabsContent value="image" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="image-upload">Upload Article Image</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-background"
                    />
                  </div>

                  {image && (
                    <div className="mt-4">
                      <img
                        src={image}
                        alt="Uploaded preview"
                        className="max-w-full rounded-lg border border-border"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleOCR}
                    disabled={ocrLoading || !image}
                    className="w-full flex items-center justify-center"
                  >
                    {ocrLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {ocrLoading ? `Extracting (${ocrProgress}%)...` : "Extract Text"}
                  </Button>

                  {ocrText && (
                    <div className="mt-4 space-y-2">
                      <Label>Extracted Text</Label>
                      <Textarea
                        value={ocrText}
                        readOnly
                        className="min-h-[200px] bg-background"
                      />
                      <Button
                        className="w-full"
                        onClick={() => handleAnalyze(ocrText)}
                        disabled={loading}
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {loading ? "Analyzing..." : "Analyze Extracted Text"}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Detect;

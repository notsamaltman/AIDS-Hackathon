import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Link as LinkIcon, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Detect = () => {
  const [activeTab, setActiveTab] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    let payload: any = {};

    if (activeTab === "text") {
      // Combine title + content into one text string
      payload = {"input":"text",  text: `${title}\n${content}` };
    } else if (activeTab === "url") {
      // Just send the URL as text for now
      payload = { text: url };
    } else {
      // handle image later
      return;
    }

    try {
      const response = await fetch("https://99767aeec8fd.ngrok-free.app/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to fetch analysis");

      const data = await response.json();
      if (data.label == 1) {data.prediciton = "FAKE"} else{ data.prediction="REAL";}
      if(payload["input"]=="text"){ data.inputType="Text"}
      // Navigate to Results page with response
      navigate("/results", { state: { result: data } });

    } catch (err) {
      console.error(err);
      alert("Error analyzing article. Please try again.");
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <Button className="w-full" onClick={handleAnalyze}>Analyze Article</Button>
                </TabsContent>

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
                  <p className="text-sm text-muted-foreground">
                    Enter the URL of the article you want to analyze. We'll fetch and analyze the content automatically.
                  </p>
                  <Button className="w-full" onClick={handleAnalyze}>Fetch & Analyze</Button>
                </TabsContent>

                <TabsContent value="image" className="space-y-4 mt-6">
                  {/* Image upload logic can go here */}
                  <Button className="w-full" disabled>Analyze Image</Button>
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

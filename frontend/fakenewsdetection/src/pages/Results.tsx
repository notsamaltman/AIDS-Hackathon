import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  ExternalLink,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Pull backend result from navigation state
  const result = location.state?.result || {};
  
  useEffect(() => {
    if (!location.state?.result) {
      navigate("/detect");
    }
  }, [location.state, navigate]);

  const getVerdictColor = () => {
    if (result.prediction === "FAKE") return "text-destructive";
    if (result.prediction === "REAL") return "text-primary";
    return "text-muted-foreground";
  };

  const getVerdictIcon = () => {
    if (result.prediction === "FAKE") return <XCircle className="h-16 w-16 text-destructive" />;
    if (result.prediction === "REAL") return <CheckCircle2 className="h-16 w-16 text-primary" />;
    return <AlertCircle className="h-16 w-16 text-muted-foreground" />;
  };

  const getInputIcon = () => {
    if (result.inputType === "url") return <LinkIcon className="h-4 w-4" />;
    if (result.inputType === "image") return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/detect")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          New Analysis
        </Button>

        {/* Main Verdict Card */}
        <Card className="mb-6">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">{getVerdictIcon()}</div>
            <CardTitle className={`text-3xl md:text-4xl mb-2 ${getVerdictColor()}`}>
              {result.label === "FAKE" && "Likely Fake News"}
              {result.label === "REAL" && "Likely Legitimate"}
              {result.label === "UNCERTAIN" && "Uncertain - Needs Review"}
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 text-base">
              {getInputIcon()}
              Input Type: {result.inputType?.toUpperCase() || "N/A"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
  {/* Confidence Score */}
  {result.probability !== undefined ? (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Confidence Score</span>
        <span className="text-sm font-bold">{result.probability * 100}%</span>
      </div>
      <Progress value={result.probability * 100} className="h-3" />
    </div>
  ) : (
    <div className="text-sm text-muted-foreground">Confidence Score: N/A</div>
  )}

  {/* Word Scores / Metrics */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="p-3 rounded-lg bg-accent/50 text-center">
      <p className="text-xs text-muted-foreground mb-1">Language</p>
      <p className="font-semibold">{result.metrics?.languageComplexity ?? "-"}</p>
    </div>
    <div className="p-3 rounded-lg bg-accent/50 text-center">
      <p className="text-xs text-muted-foreground mb-1">Emotional</p>
      <p className="font-semibold">{result.metrics?.emotionalTone ?? "-"}</p>
    </div>
    <div className="p-3 rounded-lg bg-accent/50 text-center">
      <p className="text-xs text-muted-foreground mb-1">Factual</p>
      <p className="font-semibold">{result.metrics?.factualDensity ?? "-"}</p>
    </div>
    <div className="p-3 rounded-lg bg-accent/50 text-center">
      <p className="text-xs text-muted-foreground mb-1">Source</p>
      <p className="font-semibold">{result.metrics?.sourceCredibility ?? "-"}</p>
    </div>
  </div>

  {/* Reasoning Section */}
  <div className="mt-4 p-4 bg-gray-100 rounded border border-gray-300">
    <h4 className="font-semibold mb-2 text-lg">Reasoning</h4>
    <p className="text-sm text-gray-700">{result.reasoning ?? "No reasoning provided."}</p>
  </div>
</CardContent>

        </Card>
        {/* Agree / Contradict Links Card */}
<Card className="mb-6">
  <CardHeader>
    <CardTitle>Supporting & Contradicting Sources</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Agree Links */}
    <div>
      <h4 className="font-semibold mb-2">Agreeing Links</h4>
      {result.agreelinks && result.agreelinks.length > 0 ? (
        <ul className="list-disc list-inside space-y-1">
          {result.agreelinks.map((link, idx) => (
            <li key={idx}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${result.label === "FAKE" ? "text-red-600" : result.label === "UNCERTAIN" ? "text-blue-600" : "text-green-600"}`}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No agreeing links found.</p>
      )}
    </div>

    {/* Contradict Links */}
    <div>
      <h4 className="font-semibold mb-2">Contradicting Links</h4>
      {result.contradictlnks && result.contradictlnks.length > 0 ? (
        <ul className="list-disc list-inside space-y-1">
          {result.contradictlnks.map((link, idx) => (
            <li key={idx}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${result.label === "FAKE" ? "text-red-600" : result.label === "UNCERTAIN" ? "text-blue-600" : "text-green-600"}`}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No contradicting links found.</p>
      )}
    </div>
  </CardContent>
</Card>
      </div>
    </div>
  );
};

export default Results;

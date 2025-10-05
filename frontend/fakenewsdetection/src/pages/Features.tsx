import { CheckCircle, Shield, BarChart3, ExternalLink, Zap, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Multi-Input Support",
      description: "Accept news articles via title & body text, article URLs, or images with OCR-extracted text for maximum flexibility."
    },
    {
      icon: BarChart3,
      title: "Confidence Scoring",
      description: "Receive detailed confidence scores with visual representation showing the likelihood of fake news."
    },
    {
      icon: CheckCircle,
      title: "Verdict Analysis",
      description: "Get clear verdicts: Fake, Real, or Uncertain, along with key signals influencing the decision."
    },
    {
      icon: ExternalLink,
      title: "Evidence Integration",
      description: "Retrieve supporting or contradicting articles from Twitter/X, Reddit, and other trusted sources."
    },
    {
      icon: Eye,
      title: "Interactive Dashboard",
      description: "Highlight suspicious text cues, visualize confidence levels, and explore external evidence in an organized panel."
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Fast, efficient analysis powered by multi-agent AI systems for instant results."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Platform Features
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive fake news detection with explainable AI and evidence-based analysis
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Deliverables Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            What You Get
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Functional Application</h3>
                <p className="text-sm text-muted-foreground">
                  Fully functional web app demonstrating fake-news detection with explainable results
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">Interactive Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Visual dashboard showing verdicts, confidence scores, signals, and external evidence
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">User Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Responsive design, intuitive navigation, and seamless interaction across all devices
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;

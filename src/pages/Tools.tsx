import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { QrCode, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const tools = [
  {
    title: "QR Code Generator & Scanner",
    icon: QrCode,
    description:
      "Generate custom QR codes with logos, colors, and password protection. Scan QR codes to extract data securely.",
    features: ["Custom Colors", "Logo Integration", "Password Protection", "Multiple Formats"],
    path: "/tools/qr-code",
    status: "Available",
  },
  {
    title: "More Tools Coming Soon",
    icon: Wrench,
    description:
      "I'm continuously building useful tools. Stay tuned for more productivity enhancers!",
    features: ["In Development"],
    path: null,
    status: "Coming Soon",
  },
];

const Tools = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Tools
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            A collection of useful utilities I've built
          </p>

          <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        tool.status === "Available"
                          ? "text-green-600 bg-green-100 dark:bg-green-900/20"
                          : "text-amber-600 bg-amber-100 dark:bg-amber-900/20"
                      }`}
                    >
                      {tool.status}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-muted-foreground mb-4">
                    {tool.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {tool.features.map((feature, i) => (
                      <span
                        key={i}
                        className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {tool.path && (
                    <Button
                      onClick={() => navigate(tool.path)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Open Tool
                    </Button>
                  )}
                  {!tool.path && (
                    <Button
                      disabled
                      className="w-full"
                      variant="outline"
                    >
                      Coming Soon
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Tools;

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { GraduationCap, Award } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { a } from "node_modules/framer-motion/dist/types.d-BJcRxCew";
import { Link } from "react-router-dom";
import { link } from "fs";

const About = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const education = [
    {
      degree: "B.Tech in Agricultural and Food Engineering",
      institution: "Indian Institute of Technology Kharagpur",
      period: "2024 - 2028",
      cgpa: "7.96",
      logo: "about/kgp-logo.png",
      link: "https://iitkgp.ac.in",
    },
    {
      degree: "Class XII",
      institution: "Shri Paliram Brijlal Sr Sec School, Surajgarh",
      period: "2023",
      percentage: "96.20%",
      logo: "about/pb-school-logo.png",
      link: "https://shashikant-kataria.vercel.app/about", 
    },
    {
      degree: "Class X",
      institution: "Tagore Public School, Surajgarh",
      period: "2021",
      percentage: "93%",
      logo: "about/tps.png",
      link: "https://www.tpssurajgarh.com/"
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8 gradient-text">
            About Me
          </h1>

          <TooltipProvider>
            <div className="bg-card border border-border rounded-lg p-8 mb-12 glow-border">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                I am a
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary font-semibold cursor-pointer mx-1 inline-block">Blockchain Developer</span>
                  </TooltipTrigger>
                    <TooltipContent side="top" align="center">Built a production-grade NFT platform using Solidity and web3.js.</TooltipContent>
                </Tooltip>
                and
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary font-semibold cursor-pointer mx-1 inline-block">Full Stack Engineer</span>
                  </TooltipTrigger>
                    <TooltipContent side="top" align="center">Delivered scalable full-stack apps from backend to UI, end-to-end.</TooltipContent>
                </Tooltip>
                , currently pursuing B.Tech in Agricultural and Food Engineering at the
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-foreground font-semibold cursor-pointer mx-1 inline-block">Indian Institute of Technology Kharagpur</span>
                  </TooltipTrigger>
                    <TooltipContent side="top" align="center">Consistently ranked among the top engineering institutes in India.</TooltipContent>
                </Tooltip>
                .
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                I build scalable backend systems using
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-foreground font-semibold cursor-pointer mx-1 inline-block">FastAPI</span>
                  </TooltipTrigger>
                    <TooltipContent side="top" align="center">Designed REST APIs with async Python and blazing-fast performance.</TooltipContent>
                </Tooltip>
                and
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-foreground font-semibold cursor-pointer mx-1 inline-block">Node.js</span>
                  </TooltipTrigger>
                    <TooltipContent side="top" align="center">Built real-time and event-driven services with Node.js and TypeScript.</TooltipContent>
                </Tooltip>
                , modern web frontends with
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-foreground font-semibold cursor-pointer mx-1 inline-block">React + Tailwind</span>
                  </TooltipTrigger>
                    <TooltipContent side="top" align="center">Created responsive, accessible UIs with React and Tailwind CSS.</TooltipContent>
                </Tooltip>
                , and cross-platform mobile apps using
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-foreground font-semibold cursor-pointer mx-1 inline-block">Flutter</span>
                  </TooltipTrigger>
                    <TooltipContent side="top" align="center">Published multi-platform apps with Flutter and Dart.</TooltipContent>
                </Tooltip>
                and
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-foreground font-semibold cursor-pointer mx-1 inline-block">React Native</span>
                  </TooltipTrigger>
                    <TooltipContent side="top" align="center">Built performant mobile apps for iOS and Android with React Native.</TooltipContent>
                </Tooltip>
                .
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I also contribute to decentralized apps and smart contract development as part of the
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-secondary font-semibold cursor-pointer mx-1 inline-block">Blockchain Team at KodeinKGP</span>
                  </TooltipTrigger>
                    <TooltipContent side="top" align="center">Web3 & AI society at IIT Kharagpur, building the future of decentralized tech.</TooltipContent>
                </Tooltip>
                , IIT Kharagpur's Web3 & AI society.
              </p>
            </div>
          </TooltipProvider>

          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <GraduationCap className="text-primary" />
            Education
          </h2>

          <div ref={ref} className="space-y-6">
            {education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors relative overflow-hidden"
              >
                {/* Logo/Crest Watermark */}
                {edu.logo && (
                  <Link to={edu.link} target="_blank" rel="noopener noreferrer">
                    <img
                      src={edu.logo}
                      alt={`${edu.institution} Logo`}
                      className="absolute bottom-4 right-6 w-12 h-12 md:w-10 md:h-10 md:bottom-3 md:right-6 object-contain opacity-80 pointer-events-none select-none drop-shadow transition-all duration-200"
                    />
                  </Link>
                )}
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {edu.degree}
                    </h3>
                    <p className="text-muted-foreground mb-1">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground">{edu.period}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary">
                      {edu.cgpa || edu.percentage}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;

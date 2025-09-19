import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="border-white/5 border-t bg-white/[0.02] py-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <p className="font-medium text-sm text-white/60">
          Made with ♥️ by Pratham
        </p>
        <div className="flex items-center gap-4">
          <Link
            className="text-white/40 transition-colors duration-200 [transform:translate3d(0,0,0)] [will-change:color] hover:text-white"
            href="https://github.com/prathamdby"
            target="_blank"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            className="text-white/40 transition-colors duration-200 [transform:translate3d(0,0,0)] [will-change:color] hover:text-white"
            href="https://twitter.com/prathamdby"
            target="_blank"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            className="text-white/40 transition-colors duration-200 [transform:translate3d(0,0,0)] [will-change:color] hover:text-white"
            href="https://linkedin.com/in/prathamdby"
            target="_blank"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;

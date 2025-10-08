"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transitionType, setTransitionType] = useState<
    "slide" | "fade" | "scale"
  >("slide");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsExiting(false);
    setIsLoading(false);
    setIsVisible(false);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (href && href.startsWith("/") && href !== pathname) {
      if (href === "/report") {
        setTransitionType("scale");
      } else if (href === "/map") {
        setTransitionType("fade");
      } else {
        setTransitionType("slide");
      }

      setIsExiting(true);
      setIsLoading(true);

      setTimeout(() => {
        router.push(href);
      }, 300);
    }
  };

  useEffect(() => {
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((link) => {
      link.addEventListener("click", handleLinkClick as any);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleLinkClick as any);
      });
    };
  }, [pathname, router]);

  const getTransitionClass = () => {
    if (isExiting) {
      return transitionType === "fade"
        ? "page-fade-exit"
        : transitionType === "scale"
          ? "page-scale-exit"
          : "page-exit";
    }
    if (isVisible) {
      return transitionType === "fade"
        ? "page-fade-enter"
        : transitionType === "scale"
          ? "page-scale-enter"
          : "page-enter";
    }
    return "";
  };

  return (
    <div className={`page-transition-container ${className}`}>
      <div
        className={`page-transition-content ${getTransitionClass()} ${isLoading ? "page-loading" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

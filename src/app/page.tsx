import React from "react";
import Hero from "@/modules/hero/Hero";
import Features from "@/modules/features/Features";
import Pricing from "@/modules/pricing/Pricing";
import Editor from "@/modules/editor/Editor";
import Footer from "@/components/Footer";

const page = () => {
  return (
    <div>
      <Hero />
      <Features />
      <Pricing />
      <Editor />
      <Footer />
    </div>
  );
};

export default page;

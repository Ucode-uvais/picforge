import React from "react";
import Hero from "@/modules/hero/Hero";
import Features from "@/modules/features/Features";
import Pricing from "@/modules/pricing/Pricing";
import Editor from "@/modules/editor/Editor";

const page = () => {
  return (
    <div>
      <Hero />
      <Features />
      <Pricing />
      <Editor />
    </div>
  );
};

export default page;

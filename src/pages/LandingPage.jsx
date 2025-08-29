import React from "react";
import Hero from "../components/Hero";
import AnimatedSection from "../components/AnimatedSection";
import ExploreCourses from "../components/ExploreCourses";
import RecommendedCourses from "../components/RecommendedCourses";
import CourseCategories from "../components/CourseCategories";
import FeaturedInstructors from "../components/FeaturedInstructors";
import Testimonials from "../components/Testimonials";
import CallToAction from "../components/CallToAction";
import SessionsHero from "../components/SessionsHero";

const LandingPage = () => {
  return (
    <>
      <Hero />
      <AnimatedSection delay={0.05}>
        <SessionsHero />
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <ExploreCourses />
      </AnimatedSection>
      <AnimatedSection delay={0.15}>
        <RecommendedCourses />
      </AnimatedSection>
      <AnimatedSection delay={0.2}>
        <CourseCategories />
      </AnimatedSection>
      <AnimatedSection delay={0.25}>
        <FeaturedInstructors />
      </AnimatedSection>
      <AnimatedSection delay={0.3}>
        <Testimonials />
      </AnimatedSection>
      <AnimatedSection delay={0.35}>
        <CallToAction />
      </AnimatedSection>
    </>
  );
};

export default LandingPage;

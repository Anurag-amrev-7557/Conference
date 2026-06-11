import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { motionInitial, usePrefersReducedMotion } from '../lib/motion';
import { ArrowLeft, BookX } from 'lucide-react';
import { SeoHead } from '../seo/SeoHead';
import { usePageSeo } from '../seo/usePageSeo';
import { useWebsiteData } from '../components/WebsiteDataProvider';

export const NotFoundPage: React.FC = () => {
  const seo = usePageSeo();
  const { data } = useWebsiteData();
  const copy = data.settings.notFound ?? {};
  const reduceMotion = usePrefersReducedMotion();

  return (
    <>
      <SeoHead seo={seo} />
      <div className="min-h-screen flex items-center justify-center bg-off p-6 relative">
        <div className="absolute inset-0 bg-grid-studio opacity-40 pointer-events-none" />

        <motion.div
          initial={motionInitial(reduceMotion) ?? { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center relative z-10"
        >
          <div className="bg-white p-12 sm:p-20 rounded-[48px] border border-border/40 shadow-alabaster">
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 rounded-3xl bg-accent/5 flex items-center justify-center mb-8 border border-accent/10">
                <BookX className="w-12 h-12 text-accent" />
              </div>
              <span className="text-playbook text-accent mb-4 tracking-[0.6em]">
                {copy.eyebrow ?? 'Error Code 404'}
              </span>
              <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight text-text leading-none mb-6">
                {copy.title ?? 'Record Not Found'}
              </h1>
              <p className="text-lg text-muted max-w-md mx-auto leading-relaxed font-light">
                {copy.lede ??
                  'The playbook guide or resource you are looking for does not exist in our library.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Link
                to={copy.primaryCtaHref ?? '/'}
                className="px-8 py-4 bg-accent text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-accent2 transition-all shadow-lg shadow-accent/20 group w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {copy.primaryCtaLabel ?? 'Return to Playbook Hub'}
              </Link>
              <Link
                to={copy.secondaryCtaHref ?? '/blog'}
                className="px-8 py-4 border border-border text-text rounded-2xl font-bold hover:bg-off transition-all w-full sm:w-auto"
              >
                {copy.secondaryCtaLabel ?? 'Search Resources'}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

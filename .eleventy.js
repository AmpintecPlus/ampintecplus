const { minify: minifyHtml } = require("html-minifier-terser");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");

  eleventyConfig.addFilter("ymd", (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 10);
  });

  // AEO T29：麵包屑（可見導覽 + BreadcrumbList JSON-LD 共用同一份資料）。
  // 只用 nav.json／footerNav.json 的既有標籤，以及首頁已核准/已列入 COPY_REVIEW 的
  // home.service_* 文案，不產生任何新文字。首頁本身回傳單一項目（呼叫端應跳過不渲染）。
  const SUBPAGE_LABEL_I18N_KEY = {
    "lpbf-metal-3d-printing": "home.service_lpbf_title",
    "post-processing": "home.service_post_title",
    "obsolete-spare-parts": "home.service_obsolete_title",
  };
  function getPath(obj, dotPath) {
    return dotPath.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
  }
  eleventyConfig.addFilter("breadcrumbTrail", function (pageUrl, lang, nav, footerNav, i18n) {
    const homeUrl = `/${lang}/`;
    const homeItem = nav[lang].find((n) => n.key === "home");
    const trail = [{ label: homeItem.label, url: homeUrl, current: pageUrl === homeUrl }];
    if (pageUrl === homeUrl) return trail;

    const segments = pageUrl.split("/").filter(Boolean); // ["zh","services","lpbf-metal-3d-printing"]
    const topKey = segments[1];
    const subKey = segments[2];

    const navItem = nav[lang].find((n) => n.key === topKey);
    if (navItem) {
      const topUrl = `/${lang}/${navItem.path}`;
      const subLabelKey = subKey && SUBPAGE_LABEL_I18N_KEY[subKey];
      if (subLabelKey) {
        trail.push({ label: navItem.label, url: topUrl, current: false });
        trail.push({ label: getPath(i18n[lang], subLabelKey), url: pageUrl, current: true });
      } else {
        trail.push({ label: navItem.label, url: pageUrl, current: true });
      }
      return trail;
    }

    const footerLabels = footerNav[lang];
    if (footerLabels && footerLabels[topKey]) {
      trail.push({ label: footerLabels[topKey], url: pageUrl, current: true });
    }
    return trail;
  });

  // 只在正式 build 時壓縮 HTML（本機 npm run dev 預覽時保留原樣，方便除錯）
  eleventyConfig.addTransform("htmlmin", async function (content) {
    if (process.env.ELEVENTY_RUN_MODE === "build" && this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      return minifyHtml(content, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
      });
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};

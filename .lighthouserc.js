export default {
  ci: {
    collect: {
      url: [
        "https://tc-travel-vietnam.vercel.app/",
        "https://tc-travel-vietnam.vercel.app/tours",
        "https://tc-travel-vietnam.vercel.app/customize-tour"
      ],
      numberOfRuns: 2,
      settings: {
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          disabled: false
        },
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 4
        }
      }
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.75 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
        "audits/total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "audits/largest-contentful-paint": ["warn", { maxNumericValue: 3000 }],
        "audits/cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }]
      }
    },
    upload: {
      target: "temporary-public-storage"
    }
  }
};

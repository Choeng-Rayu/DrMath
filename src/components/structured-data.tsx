import type { HomepageViewProps } from "@/components/homepage-view";
import { getDriveImage } from "@/lib/drive";
import { getYouTubeEmbed, getYouTubeThumbnail } from "@/lib/youtube";

export function StructuredData({
  content,
  settings,
  subjects = [],
  videos = [],
  exercises = [],
  posts = [],
}: HomepageViewProps) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://drmaths.online").replace(/\/$/, "");

  const heroImageDrive = getDriveImage(content["hero.imageDriveUrl"] ?? "");
  const heroImageUrl = heroImageDrive?.renderUrl || `${baseUrl}/images/Photo-A.jpg`;
  const logoUrl = settings.logoRenderUrl || `${baseUrl}/logo.jpg`;

  const sameAsLinks = [
    settings.telegramUrl,
    settings.tiktokUrl,
    settings.facebookUrl,
    settings.instagramUrl,
  ].filter(Boolean) as string[];

  const schemaGraph = [
    // 1. Person: Founder & Lead Educator (Korm Sambath / លោកគ្រូ គរ សម្បត្តិ)
    {
      "@type": "Person",
      "@id": `${baseUrl}/#founder`,
      name: "Korm Sambath",
      alternateName: [
        "គរ សម្បត្តិ",
        "លោកគ្រូ គរ សម្បត្តិ",
        "Sambath Korm",
        "Teacher Sambath",
        "គ្រូ សម្បត្តិ",
        "Korm Sambath (គរ សម្បត្តិ)",
      ],
      jobTitle: "Founder & Lead Mathematics Educator",
      description:
        "Founder and lead educator at DR.MATHS Education Center, specializing in Mathematics and Science for Cambodian students (Grades 3 to 12).",
      image: heroImageUrl,
      url: `${baseUrl}/#about`,
      worksFor: {
        "@id": `${baseUrl}/#organization`,
      },
      sameAs: sameAsLinks,
    },

    // 2. Educational Organization: DR.MATHS Education Center
    {
      "@type": "EducationalOrganization",
      "@id": `${baseUrl}/#organization`,
      name: "DR.MATHS Education Center",
      alternateName: [
        "DR.MATHS",
        "Dr. Maths",
        "Doctor Maths",
        "មជ្ឈមណ្ឌលអប់រំ DR.MATHS",
        "DR.MATHS Education Center by Korm Sambath",
      ],
      url: baseUrl,
      logo: logoUrl,
      image: heroImageUrl,
      description:
        settings.seoDescriptionKh ||
        "ថ្នាក់បង្រៀន គណិតវិទ្យា រូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងភាសាខ្មែរ ដោយលោកគ្រូ គរ សម្បត្តិ (Korm Sambath)",
      founder: {
        "@id": `${baseUrl}/#founder`,
      },
      telephone: settings.phones,
      sameAs: sameAsLinks,
      address: {
        "@type": "PostalAddress",
        addressCountry: "KH",
        description: settings.addressKh || "Phnom Penh, Cambodia",
      },
    },

    // 3. WebSite Schema
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "DR.MATHS Education Center",
      alternateName: [
        "DR.MATHS",
        "Korm Sambath Math Education",
        "លោកគ្រូ គរ សម្បត្តិ គណិតវិទ្យា",
      ],
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      inLanguage: "km-KH",
    },

    // 4. Curriculum / Course Subjects taught by Korm Sambath
    ...subjects.map((subject) => ({
      "@type": "Course",
      "@id": `${baseUrl}/#subject-${subject.id}`,
      name: subject.nameKh,
      description: subject.descriptionKh,
      provider: {
        "@id": `${baseUrl}/#organization`,
      },
      instructor: {
        "@id": `${baseUrl}/#founder`,
      },
    })),

    // 5. Video Lessons by Korm Sambath
    ...videos.map((video) => ({
      "@type": "VideoObject",
      "@id": `${baseUrl}/#video-${video.youtubeId}`,
      name: video.titleKh,
      description:
        video.seriesKh ||
        content["videos.description"] ||
        `មេរៀនគណិតវិទ្យា និងវិទ្យាសាស្ត្របង្រៀនដោយលោកគ្រូ គរ សម្បត្តិ (Korm Sambath) នៅ DR.MATHS`,
      thumbnailUrl: video.thumbUrl || getYouTubeThumbnail(video.youtubeId),
      embedUrl: getYouTubeEmbed(video.youtubeId),
      author: {
        "@id": `${baseUrl}/#founder`,
      },
      creator: {
        "@id": `${baseUrl}/#founder`,
      },
    })),

    // 6. Exercises & Worksheets by Korm Sambath
    ...exercises.map((exercise) => ({
      "@type": "LearningResource",
      "@id": `${baseUrl}/#exercise-${exercise.id}`,
      name: exercise.titleKh,
      description:
        exercise.descriptionKh ||
        `លំហាត់ និងវិញ្ញាសាអនុវត្ត រៀបចំដោយលោកគ្រូ គរ សម្បត្តិ (Korm Sambath)`,
      learningResourceType: "Worksheet / Exam Preparation",
      educationalLevel: exercise.gradeKh || "ថ្នាក់ទី៣–១២",
      author: {
        "@id": `${baseUrl}/#founder`,
      },
    })),

    // 7. Job Announcements / Teacher Recruitment
    ...posts.filter((post) => post.titleKh.includes("ជ្រើសរើស")).map((post) => ({
      "@type": "JobPosting",
      "@id": `${baseUrl}/#job-${post.id}`,
      title: post.titleKh,
      description: post.contentKh,
      datePosted: new Date(post.createdAt).toISOString(),
      hiringOrganization: {
        "@id": `${baseUrl}/#organization`,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: "KH",
          addressLocality: "Phnom Penh",
        },
      },
      employmentType: "FULL_TIME",
    })),
  ];

  const jsonLdString = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemaGraph,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  );
}

export type ReviewStatus = "unverified" | "verified" | "needs_review" | "incorrect" | "unclear";
export type MatchType = "exact" | "close" | "similar" | "topic" | "none";

export type BookMapReview = {
  status: ReviewStatus;
  note: string;
  correctedBook?: string | null;
  correctedReference?: string | null;
  correctedPrintedPage?: number | null;
  correctedPdfPage?: number | null;
  updatedAt?: Date | string | null;
};

export type BookMapItem = {
  id: string;
  source: string;
  section: string;
  matchType: MatchType;
  bookShortName: string | null;
  bookTitle?: string | null;
  bookR2Key?: string | null;
  reference: string;
  printedPage: number | null;
  pdfPage: number | null;
  solutionPdfPage: number | null;
  evidence: string;
  review: BookMapReview;
};

export type FigureReview = {
  status: ReviewStatus;
  issueTags: string[];
  note: string;
  updatedAt?: Date | string | null;
};

export type FigureItem = {
  id: string;
  figureNumber: number;
  figureKey: string;
  sourceLabel: string;
  questionLabel: string;
  originalImageKey: string;
  redrawnSvgKey: string | null;
  redrawnPngKey: string;
  tikzSourcePath: string;
  review: FigureReview;
};

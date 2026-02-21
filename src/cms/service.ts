import axios from "axios";
import { apiClient } from "@/api/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import {
  LOGIN_PAGE_CMS,
  LOGIN_PAGE_DEFAULTS,
  type LoginPageCmsContent,
} from "./config/loginPage";
import {
  MANAGEMENT_DASHBOARD_CMS,
  MANAGEMENT_DASHBOARD_DEFAULTS,
  type ManagementDashboardCmsContent,
} from "./config/managementDashboard";

type StrapiRecord = Record<string, unknown>;

type StrapiCmsResponse = {
  data?: unknown;
};

export type CmsRequest = {
  schoolId?: number | null;
  schoolCode?: string | null;
};

function asRecord(value: unknown): StrapiRecord | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as StrapiRecord;
}

function unwrapRecord(entry: unknown): StrapiRecord | undefined {
  const base = asRecord(entry);
  if (!base) return undefined;

  const attributes = asRecord(base.attributes);
  if (attributes) return attributes;
  return base;
}

function firstDataRecord(payload: StrapiCmsResponse): StrapiRecord | undefined {
  const data = payload.data;
  if (Array.isArray(data)) {
    if (data.length === 0) return undefined;
    return unwrapRecord(data[0]);
  }
  return unwrapRecord(data);
}

function mediaUrlFromNode(node: unknown): string | undefined {
  const direct = asRecord(node);
  if (!direct) return undefined;

  const directUrl = direct.url;
  if (typeof directUrl === "string" && directUrl.length > 0) return directUrl;

  const nestedData = asRecord(direct.data);
  if (nestedData) {
    const nestedDataUrl = nestedData.url;
    if (typeof nestedDataUrl === "string" && nestedDataUrl.length > 0) return nestedDataUrl;

    const nestedDataAttributes = asRecord(nestedData.attributes);
    const nestedDataAttributesUrl = nestedDataAttributes?.url;
    if (
      typeof nestedDataAttributesUrl === "string" &&
      nestedDataAttributesUrl.length > 0
    ) {
      return nestedDataAttributesUrl;
    }
  }

  const nestedAttributes = asRecord(direct.attributes);
  const nestedAttributesUrl = nestedAttributes?.url;
  if (typeof nestedAttributesUrl === "string" && nestedAttributesUrl.length > 0) {
    return nestedAttributesUrl;
  }

  return undefined;
}

function safeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function isStrapiMissingContentTypeError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.response?.status !== 502) return false;

  const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
  return typeof detail === "string" && detail.includes("Strapi HTTP 404");
}

async function getCmsRecord(
  contentTypeOrAliases: string | readonly string[],
  request: CmsRequest,
): Promise<StrapiRecord | undefined> {
  const contentTypes = Array.isArray(contentTypeOrAliases)
    ? contentTypeOrAliases
    : [contentTypeOrAliases];

  let lastError: unknown;

  for (const contentType of contentTypes) {
    try {
      const response = await apiClient.get<StrapiCmsResponse>(
        API_ENDPOINTS.cms.byContentType(contentType),
        {
          params: {
            query: "populate=*",
            ...(request.schoolId ? { school_id: request.schoolId } : {}),
            ...(request.schoolCode ? { school_code: request.schoolCode } : {}),
          },
        },
      );

      return firstDataRecord(response.data);
    } catch (error) {
      lastError = error;
      if (!isStrapiMissingContentTypeError(error)) {
        throw error;
      }
    }
  }

  if (lastError) throw lastError;
  return undefined;
}

export async function getLoginPageCmsContent(
  request: CmsRequest = {},
): Promise<LoginPageCmsContent> {
  const record = await getCmsRecord(LOGIN_PAGE_CMS.contentType, request);
  if (!record) return LOGIN_PAGE_DEFAULTS;

  return {
    heroTitle: safeText(
      record[LOGIN_PAGE_CMS.fields.heroTitle],
      LOGIN_PAGE_DEFAULTS.heroTitle,
    ),
    heroSubtitle: safeText(
      record[LOGIN_PAGE_CMS.fields.heroSubtitle],
      LOGIN_PAGE_DEFAULTS.heroSubtitle,
    ),
    leftPanelImageUrl: mediaUrlFromNode(record[LOGIN_PAGE_CMS.fields.leftPanelImage]),
    brandIconUrl: mediaUrlFromNode(record[LOGIN_PAGE_CMS.fields.brandIcon]),
    termsText: safeText(
      record[LOGIN_PAGE_CMS.fields.termsText],
      LOGIN_PAGE_DEFAULTS.termsText ?? "",
    ),
  };
}

function mapManagementDashboardRecord(record: StrapiRecord): ManagementDashboardCmsContent {
  return {
    dashboardTitle: safeText(
      record[MANAGEMENT_DASHBOARD_CMS.fields.dashboardTitle],
      MANAGEMENT_DASHBOARD_DEFAULTS.dashboardTitle,
    ),
    dashboardSubtitle: safeText(
      record[MANAGEMENT_DASHBOARD_CMS.fields.dashboardSubtitle],
      MANAGEMENT_DASHBOARD_DEFAULTS.dashboardSubtitle,
    ),
    welcomeMessage: safeText(
      record[MANAGEMENT_DASHBOARD_CMS.fields.welcomeMessage],
      MANAGEMENT_DASHBOARD_DEFAULTS.welcomeMessage,
    ),
    announcementText: safeText(
      record[MANAGEMENT_DASHBOARD_CMS.fields.announcementText],
      MANAGEMENT_DASHBOARD_DEFAULTS.announcementText,
    ),
    heroImageUrl: mediaUrlFromNode(record[MANAGEMENT_DASHBOARD_CMS.fields.heroImage]),
    quickLink1Label: safeText(
      record[MANAGEMENT_DASHBOARD_CMS.fields.quickLink1Label],
      MANAGEMENT_DASHBOARD_DEFAULTS.quickLink1Label,
    ),
    quickLink1Url: safeText(
      record[MANAGEMENT_DASHBOARD_CMS.fields.quickLink1Url],
      MANAGEMENT_DASHBOARD_DEFAULTS.quickLink1Url,
    ),
    quickLink2Label: safeText(
      record[MANAGEMENT_DASHBOARD_CMS.fields.quickLink2Label],
      MANAGEMENT_DASHBOARD_DEFAULTS.quickLink2Label,
    ),
    quickLink2Url: safeText(
      record[MANAGEMENT_DASHBOARD_CMS.fields.quickLink2Url],
      MANAGEMENT_DASHBOARD_DEFAULTS.quickLink2Url,
    ),
    supportContactText: safeText(
      record[MANAGEMENT_DASHBOARD_CMS.fields.supportContactText],
      MANAGEMENT_DASHBOARD_DEFAULTS.supportContactText,
    ),
  };
}

export async function getManagementDashboardCmsContent(
  request: CmsRequest = {},
): Promise<ManagementDashboardCmsContent> {
  const candidateCodes = Array.from(
    new Set(
      [request.schoolCode?.trim(), request.schoolId ? String(request.schoolId) : undefined].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );

  for (const code of candidateCodes) {
    const record = await getCmsRecord(MANAGEMENT_DASHBOARD_CMS.contentTypes, {
      schoolCode: code,
    });
    if (record) return mapManagementDashboardRecord(record);
  }

  const hasSchoolScopedRequest = Boolean(request.schoolCode?.trim() || request.schoolId);

  if (!hasSchoolScopedRequest) {
    const globalRecord = await getCmsRecord(MANAGEMENT_DASHBOARD_CMS.contentTypes, {});
    if (globalRecord) return mapManagementDashboardRecord(globalRecord);
  }

  return MANAGEMENT_DASHBOARD_DEFAULTS;
}

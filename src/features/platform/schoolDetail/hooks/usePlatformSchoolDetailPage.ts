import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { usePlatformSchoolDashboard } from "@/hooks/usePlatformSchoolDashboard";
import { useSchools } from "@/hooks/useSchools";
import { queryKeys } from "@/constants/queryKeys";

import {
  filterPlatformSchoolRows,
  getMockMetrics,
  getMockRows,
  toPlatformSchoolDetailTab,
} from "../helpers/platformSchoolDetail.helpers";
import type {
  PlatformSchoolDashboardMetrics,
  PlatformSchoolDetailTabKey,
  PlatformSchoolPersonRow,
} from "../types/platformSchoolDetail.types";

export function usePlatformSchoolDetailPage() {
  const { schoolId: schoolIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { list } = useSchools();
  const qc = useQueryClient();

  const schoolId = Number(schoolIdParam);
  const safeSchoolId =
    Number.isFinite(schoolId) && schoolId > 0 ? schoolId : null;

  const activeTab = toPlatformSchoolDetailTab(searchParams.get("tab"));
  const setActiveTab = (tab: PlatformSchoolDetailTabKey) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next);
  };

  const school = useMemo(
    () => list.data?.find((item) => item.id === safeSchoolId) ?? null,
    [list.data, safeSchoolId],
  );

  const useMockData = false;
  const realData = usePlatformSchoolDashboard(useMockData ? null : safeSchoolId);

  const metrics = useMemo<PlatformSchoolDashboardMetrics | null>(() => {
    if (!safeSchoolId) return null;
    if (useMockData) {
      return getMockMetrics(safeSchoolId);
    }
    const payload = realData.dashboard.data;
    if (!payload) return null;
    return {
      teachers: payload.teacher_count,
      students: payload.student_count,
      staff: payload.staff_count,
      total: payload.total_registered,
    };
  }, [safeSchoolId, useMockData, realData.dashboard.data]);

  const teachers = useMemo<PlatformSchoolPersonRow[]>(() => {
    if (!safeSchoolId) return [];
    if (useMockData) return getMockRows("teachers", safeSchoolId);
    const list = realData.teachers.data ?? [];
    return list.map((item) => ({
      id: item.id,
      name: item.name,
      role: "Teacher",
      email: item.email ?? "-",
      phone: item.phone ?? "-",
      status: item.status,
      extra: "Teaching profile",
    }));
  }, [safeSchoolId, useMockData, realData.teachers.data]);

  const students = useMemo<PlatformSchoolPersonRow[]>(() => {
    if (!safeSchoolId) return [];
    if (useMockData) return getMockRows("students", safeSchoolId);
    const list = realData.students.data ?? [];
    return list.map((item) => ({
      id: item.id,
      name: item.name,
      role: "Student",
      email: "-",
      phone: item.parent_phone ?? "-",
      status: item.status,
      extra: item.parent_name
        ? `Guardian: ${item.parent_name}`
        : "Guardian pending",
    }));
  }, [safeSchoolId, useMockData, realData.students.data]);

  const staff = useMemo<PlatformSchoolPersonRow[]>(() => {
    if (!safeSchoolId) return [];
    if (useMockData) return getMockRows("staff", safeSchoolId);
    const list = realData.staff.data ?? [];
    return list.map((item) => ({
      id: item.user_id,
      name: item.name && !item.name.includes("@") ? item.name : "Unnamed User",
      role: item.role,
      email: item.email ?? "-",
      phone: item.phone ?? "-",
      status: item.status,
      extra: "Operational staff",
    }));
  }, [safeSchoolId, useMockData, realData.staff.data]);

  const activeRows = useMemo(() => {
    if (activeTab === "teachers") return teachers;
    if (activeTab === "students") return students;
    return staff;
  }, [activeTab, teachers, students, staff]);

  const filteredRows = useMemo(
    () => filterPlatformSchoolRows(activeRows, search),
    [activeRows, search],
  );

  async function refresh() {
    if (!safeSchoolId) return;
    setIsRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.platformSchoolDashboard(safeSchoolId) }),
      qc.invalidateQueries({ queryKey: queryKeys.platformSchoolTeachers(safeSchoolId) }),
      qc.invalidateQueries({ queryKey: queryKeys.platformSchoolStudents(safeSchoolId) }),
      qc.invalidateQueries({ queryKey: queryKeys.platformSchoolStaff(safeSchoolId) }),
    ]);
    setIsRefreshing(false);
  }

  return {
    safeSchoolId,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    school,
    metrics,
    filteredRows,
    refresh,
    isRefreshing,
  };
}

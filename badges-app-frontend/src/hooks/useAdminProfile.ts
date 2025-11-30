import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import type { UserDTO, CompanyDTO } from "../types";
import {
  fetchMyProfile,
  changeMyPassword,
  updateEmployee,
} from "../api/ApiEmployee";
import { fetchCompanyById, fetchCompanies } from "../api/apiCompany";

export const useAdminProfile = () => {
  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [companyName, setCompanyName] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);

  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string>("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMyProfile();
      setProfile(data);

      if (data.companyId && data.companyId > 0) {
        const company = await fetchCompanyById(data.companyId);
        setCompanyName(company.name);
      } else {
        setCompanyName("N/A");
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      toast.error("Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadCompanies = useCallback(async () => {
    setCompaniesError("");
    try {
      setCompaniesLoading(true);
      const list = await fetchCompanies();
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCompanies(list);
    } catch (e) {
      setCompaniesError(
        e instanceof Error ? `Failed to load companies: ${e.message}` : "Failed to load companies."
      );
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  const handleUpdateProfile = async (editData: Partial<UserDTO>) => {
    if (!profile) return;

    setSaving(true);
    try {
      const payload: UserDTO = {
        ...profile,
        firstName: editData.firstName?.trim() ?? profile.firstName,
        lastName: editData.lastName?.trim() ?? profile.lastName,
        email: editData.email?.trim() ?? profile.email,
        phone: editData.phone?.trim() ?? profile.phone,
        matricule: editData.matricule?.trim() ?? profile.matricule ?? "",
        companyId: editData.companyId != null ? Number(editData.companyId) : profile.companyId,
      };

      const updated = await updateEmployee(profile.id!, payload);
      setProfile(updated);

      if (updated.companyId && updated.companyId > 0) {
        try {
          const c = await fetchCompanyById(updated.companyId);
          setCompanyName(c.name);
        } catch { setCompanyName("N/A"); }
      } else {
        setCompanyName("N/A");
      }
      toast.success("Profile updated successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || error.message || "Update failed");
      } else {
        toast.error("An unexpected error occurred.");
      }
      throw error; // re-throw to be caught in component
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    setPasswordChanging(true);
    try {
      await changeMyPassword(newPassword);
      toast.success("Password changed successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || error.message || "Error");
      } else {
        toast.error("An unexpected error occurred.");
      }
      throw error; // re-throw
    } finally {
      setPasswordChanging(false);
    }
  };

  return {
    profile,
    companyName,
    loading,
    saving,
    passwordChanging,
    companies,
    companiesLoading,
    companiesError,
    loadCompanies,
    handleUpdateProfile,
    handleChangePassword,
  };
};

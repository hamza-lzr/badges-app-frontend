import React, { useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useAdminProfile } from "../hooks/useAdminProfile";
import type { UserDTO } from "../types";

import ProfileCard from "../components/profile/ProfileCard";
import EditProfileModal from "../components/profile/EditProfileModal";
import ChangePasswordModal from "../components/profile/ChangePasswordModal";

import "./AdminProfile.css";

const MyAdminProfilePage: React.FC = () => {
  const {
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
  } = useAdminProfile();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleEditSubmit = async (editData: Partial<UserDTO>) => {
    try {
      await handleUpdateProfile(editData);
      setShowEditModal(false);
    } catch {
      // Error is already toasted in the hook
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      await handleChangePassword(password);
      setShowPasswordModal(false);
    } catch {
      // Error is already toasted in the hook
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center mt-5">
        <Spinner animation="border" variant="secondary" />
        <p className="text-muted mt-3">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <Container className="text-center mt-4">
        <p className="text-muted">Could not load your profile. Please try again later.</p>
      </Container>
    );
  }

  return (
    <Container className="py-5 profile-container" style={{ maxWidth: "850px" }}>
      <div className="text-center mb-5">
        <h1 className="fw-bold profile-title">My Profile</h1>
        <p className="text-muted">Manage your personal information and credentials</p>
      </div>

      <ProfileCard
        profile={profile}
        companyName={companyName}
        onEdit={() => setShowEditModal(true)}
        onChangePassword={() => setShowPasswordModal(true)}
      />

      <EditProfileModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        profile={profile}
        companies={companies}
        companiesLoading={companiesLoading}
        companiesError={companiesError}
        saving={saving}
        onLoadCompanies={loadCompanies}
        onSubmit={handleEditSubmit}
      />

      <ChangePasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        changing={passwordChanging}
        onSubmit={handlePasswordSubmit}
      />
    </Container>
  );
};

export default MyAdminProfilePage;


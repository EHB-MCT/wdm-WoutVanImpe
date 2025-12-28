"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, logout, isUserAuthenticated } from "@/lib/auth";
import { AccountMenu } from "@/components/account/AccountMenu";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { MessageDisplay } from "@/components/ui/MessageDisplay";
import { authApi, type ProfileUpdateRequest, type PasswordChangeRequest, ApiError } from "@/lib/api";
import { User } from "@/types/receipt";
import { VALIDATION } from "@/lib/constants";
import styles from "@/styles/components/Account.module.css";

/**
 * Account page component for user profile management.
 * Handles user profile editing, password changing, and account navigation.
 * @returns {JSX.Element} Account management interface.
 */
export default function AccountPage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [activeView, setActiveView] = useState<"menu" | "profile" | "password">("menu");
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
    const [profileForm, setProfileForm] = useState({ username: "", email: "" });
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (!isUserAuthenticated()) {
            router.push("/account/login");
            return;
        }
        const storedUser = getStoredUser();
        if (storedUser) {
            setUser(storedUser);
            setProfileForm({ username: storedUser.username, email: storedUser.email });
        }
    }, [router]);

    const checkProfileChanges = () => {
        if (user) {
            const changesMade = profileForm.username !== user.username || profileForm.email !== user.email;
            setHasChanges(changesMade);
        }
    };

    useEffect(() => {
        checkProfileChanges();
    }, [profileForm, user]);

    const handleLogout = () => {
        setMessage({ type: "success", text: "Succesvol uitgelogd!" });
        logout();
        setTimeout(() => {
            router.push("/account/login");
        }, VALIDATION.LOGOUT_REDIRECT_DELAY_MS);
    };

    const handlePasswordChange = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            setMessage({ type: "error", text: "Vul beide velden in" });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setMessage({ type: "error", text: "Wachtwoord moet minimaal 6 tekens zijn" });
            return;
        }

        setIsLoading(true);
        try {
            const passwordData: PasswordChangeRequest = {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            };

            await authApi.changePassword(passwordData);

            setMessage({ type: "success", text: "Wachtwoord succesvol gewijzigd!" });
            setPasswordForm({ currentPassword: "", newPassword: "" });
            setActiveView("menu");
        } catch (error) {
            console.error("Password change error:", error);
            if (error instanceof ApiError) {
                setMessage({ type: "error", text: error.message });
            } else {
                setMessage({ type: "error", text: "Netwerkfout, probeer opnieuw" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileSave = async () => {
        if (!profileForm.username.trim() || !profileForm.email.trim()) {
            setMessage({ type: "error", text: "Vul beide velden in" });
            return;
        }

        if (!profileForm.email.includes("@")) {
            setMessage({ type: "error", text: "Voer een geldig emailadres in" });
            return;
        }

        setIsLoading(true);
        try {
            const profileData: ProfileUpdateRequest = {
                username: profileForm.username,
                email: profileForm.email,
            };

            const response = await authApi.updateProfile(profileData);

            setMessage({ type: "success", text: "Profiel succesvol bijgewerkt!" });
            setUser(response.user);
            setProfileForm({ username: response.user.username, email: response.user.email });
            setHasChanges(false);
        } catch (error) {
            console.error("Profile update error:", error);
            if (error instanceof ApiError) {
                setMessage({ type: "error", text: error.message });
            } else {
                setMessage({ type: "error", text: "Netwerkfout, probeer opnieuw" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const goBack = () => {
        setActiveView("menu");
        setPasswordForm({ currentPassword: "", newPassword: "" });
        if (user) {
            setProfileForm({ username: user.username, email: user.email });
            setHasChanges(false);
        }
    };

    if (!user) {
        return (
            <div className={styles.authContainer}>
                <div className="card">
                    <p>Laden...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authWrapper}>
                <div className="card">
                    <div className={`${styles.accountHeader} flex-center`}>
                        <h1 className={styles.authTitle}>
                            {activeView === "menu" ? `Hallo, ${user.username}!` : 
                             activeView === "profile" ? "Profiel" : 
                             activeView === "password" ? "Wachtwoord wijzigen" : "Account"}
                        </h1>
                    </div>

                    {message && <MessageDisplay message={message} />}

                    {activeView === "menu" && (
                        <AccountMenu 
                            onProfileClick={() => setActiveView("profile")} 
                            onPasswordClick={() => setActiveView("password")} 
                            onLogout={handleLogout} 
                        />
                    )}

                    {activeView === "profile" && (
                        <ProfileForm 
                            profileForm={profileForm} 
                            onProfileChange={(field, value) => setProfileForm({ ...profileForm, [field]: value })} 
                            onSave={handleProfileSave} 
                            onCancel={goBack} 
                            isLoading={isLoading} 
                            hasChanges={hasChanges} 
                        />
                    )}

                    {activeView === "password" && (
                        <PasswordForm 
                            passwordForm={passwordForm} 
                            onPasswordChange={(field, value) => setPasswordForm({ ...passwordForm, [field]: value })} 
                            onSave={handlePasswordChange} 
                            onCancel={goBack} 
                            isLoading={isLoading} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
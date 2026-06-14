
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserRound,
  Mail,
  Briefcase,
  Calendar,
  Save,
  Lock,
  Loader2
} from "lucide-react";

const JOB_TITLE_OPTIONS = [
  "Founder",
  "Product Manager",
  "Project Manager",
  "Designer",
  "Developer",
  "Marketing",
  "Operations",
  "Admin",
  "Manager",
  "Member",
] as const;

const CUSTOM_JOB_TITLE_VALUE = "__other__";

const isPresetJobTitle = (value: string) =>
  JOB_TITLE_OPTIONS.includes(value as (typeof JOB_TITLE_OPTIONS)[number]);

const Profile = () => {
  const { user, updateUser } = useAuth();
  const profile = useQuery(api.profiles.current);
  const updateProfile = useMutation(api.profiles.updateCurrent);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    avatar: "",
    bio: "",
    location: "",
    joinDate: "",
  });
  const [formData, setFormData] = useState({ ...profileData });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch profile data
  useEffect(() => {
    if (!user || !profile) return;

    const newData = {
      name: profile.name || user.name || "",
      email: profile.email || user.email || "",
      jobTitle: profile.jobTitle || "",
      avatar: profile.avatar || user.avatarUrl || "",
      bio: profile.bio || "",
      location: profile.location || "",
      joinDate: profile.joinDate || "",
    };

    setProfileData(newData);
    setFormData(newData);
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const hasAnyChanges = Object.keys(formData).some(
      key => formData[key as keyof typeof formData] !== profileData[key as keyof typeof profileData]
    );
    setHasChanges(hasAnyChanges);
  }, [formData, profileData]);

  const selectedJobTitle = isPresetJobTitle(formData.jobTitle)
    ? formData.jobTitle
    : CUSTOM_JOB_TITLE_VALUE;

  const handleJobTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      jobTitle:
        value === CUSTOM_JOB_TITLE_VALUE
          ? (isPresetJobTitle(prev.jobTitle) ? "" : prev.jobTitle)
          : value,
    }));
  };

  const handleSave = async () => {
    if (!hasChanges || !user) return;

    if (selectedJobTitle === CUSTOM_JOB_TITLE_VALUE && formData.jobTitle.trim() === "") {
      toast.error("Enter a custom job title or choose a preset option");
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile({
        name: formData.name,
        jobTitle: formData.jobTitle.trim(),
        avatar: formData.avatar,
        bio: formData.bio,
        location: formData.location,
      });

      setProfileData({ ...formData });
      updateUser({
        name: formData.name,
        avatarUrl: formData.avatar,
      });

      toast.success("Profile updated successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              View and manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.avatar} alt={profileData.name} />
              <AvatarFallback>{profileData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-medium text-lg">{profileData.name}</h3>
              <p className="text-sm text-muted-foreground">{profileData.jobTitle}</p>
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{profileData.jobTitle}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Joined {profileData.joinDate}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.info("Password reset instructions sent to your email")}
            >
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      className="pl-10"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Select value={selectedJobTitle} onValueChange={handleJobTitleChange}>
                    <SelectTrigger id="jobTitle">
                      <SelectValue placeholder="Select a job title" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TITLE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                      <SelectItem value={CUSTOM_JOB_TITLE_VALUE}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedJobTitle === CUSTOM_JOB_TITLE_VALUE && (
                    <Input
                      id="customJobTitle"
                      name="jobTitle"
                      placeholder="Enter your job title"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Image URL</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className={!hasChanges ? "opacity-70" : ""}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

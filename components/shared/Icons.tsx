import React from "react";
import { Icon } from "@iconify/react";

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

// Helper to build style from props
const mkStyle = (color?: string, style?: React.CSSProperties): React.CSSProperties => ({
  color: color && color !== "currentColor" ? color : undefined,
  ...style,
});

export const Icons = {
  Camera: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:camera-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  User: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:user-circle-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Users: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:users-group-rounded-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Calendar: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:calendar-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Clock: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:clock-circle-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Sparkles: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:magic-stick-3-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Package: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:box-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  CreditCard: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:card-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Check: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:check-read-bold" width={size} height={size} style={mkStyle(color, style)} />
  ),

  CheckCircle: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:check-circle-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Shield: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:shield-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  AlertCircle: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:danger-circle-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Search: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:magnifer-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Trash: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:trash-bin-trash-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Edit: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:pen-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  ArrowRight: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:arrow-right-bold" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Briefcase: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:bag-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  GraduationCap: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:diploma-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Heart: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:heart-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Star: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:star-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Layers: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:layers-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  TrendingUp: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:chart-2-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  RefreshCw: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:refresh-circle-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Lock: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:lock-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Phone: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:phone-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Mail: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:letter-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  MapPin: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:map-point-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Sliders: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:tuning-2-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Eye: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:eye-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  EyeOff: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:eye-closed-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  ChevronDown: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:alt-arrow-down-bold" width={size} height={size} style={mkStyle(color, style)} />
  ),

  ChevronUp: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:alt-arrow-up-bold" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Copy: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:copy-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  ChevronLeft: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:alt-arrow-left-bold" width={size} height={size} style={mkStyle(color, style)} />
  ),

  ChevronRight: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:alt-arrow-right-bold" width={size} height={size} style={mkStyle(color, style)} />
  ),

  X: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:close-circle-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Printer: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:printer-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Download: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:download-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  MessageSquare: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:chat-square-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Send: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:plain-2-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  HelpCircle: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:question-circle-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Award: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:medal-star-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Coffee: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:cup-hot-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Zap: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:bolt-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Aperture: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:aperture-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Maximize2: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:maximize-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Grid: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:widget-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Info: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:info-circle-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  Menu: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:hamburger-menu-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  ExternalLink: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:link-circle-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),

  LogOut: ({ size = 20, color = "currentColor", style }: IconProps) => (
    <Icon icon="solar:logout-2-bold-duotone" width={size} height={size} style={mkStyle(color, style)} />
  ),
};

export default Icons;

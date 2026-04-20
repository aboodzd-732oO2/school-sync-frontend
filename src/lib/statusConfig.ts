import { FileEdit, Clock, RefreshCw, Package, CheckCircle, XCircle, Ban, PackageX, HelpCircle, LucideIcon } from "lucide-react";

export interface StatusConfig {
  label: string;
  labelPlain: string;
  icon: LucideIcon;
  tailwindClass: string;
  hexColor: string;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: {
    label: 'مسودة',
    labelPlain: 'مسودة',
    icon: FileEdit,
    tailwindClass: 'bg-muted text-muted-foreground border-border',
    hexColor: '#6b7280',
  },
  pending: {
    label: 'قيد الانتظار',
    labelPlain: 'قيد الانتظار',
    icon: Clock,
    tailwindClass: 'bg-warning/15 text-warning-foreground border-warning/30',
    hexColor: '#ffb900',
  },
  'in-progress': {
    label: 'قيد التنفيذ',
    labelPlain: 'قيد التنفيذ',
    icon: RefreshCw,
    tailwindClass: 'bg-info/10 text-info border-info/30',
    hexColor: '#00a8ff',
  },
  'ready-for-pickup': {
    label: 'جاهز للاستلام',
    labelPlain: 'جاهز للاستلام',
    icon: Package,
    tailwindClass: 'bg-tertiary/10 text-tertiary border-tertiary/30',
    hexColor: '#AD46FF',
  },
  completed: {
    label: 'مكتمل',
    labelPlain: 'مكتمل',
    icon: CheckCircle,
    tailwindClass: 'bg-success/10 text-success border-success/30',
    hexColor: '#27AF4D',
  },
  rejected: {
    label: 'مرفوض',
    labelPlain: 'مرفوض',
    icon: XCircle,
    tailwindClass: 'bg-danger/10 text-danger border-danger/30',
    hexColor: '#E44141',
  },
  cancelled: {
    label: 'ملغى',
    labelPlain: 'ملغى',
    icon: Ban,
    tailwindClass: 'bg-muted text-muted-foreground border-border',
    hexColor: '#6b7280',
  },
  undelivered: {
    label: 'لم يُستلم',
    labelPlain: 'لم يُستلم',
    icon: PackageX,
    tailwindClass: 'bg-danger/10 text-danger border-danger/30',
    hexColor: '#E44141',
  },
};

export const getStatusLabel = (status: string): string =>
  STATUS_CONFIG[status]?.label || status;

export const getStatusIcon = (status: string): LucideIcon =>
  STATUS_CONFIG[status]?.icon || HelpCircle;

export const getStatusClass = (status: string): string =>
  STATUS_CONFIG[status]?.tailwindClass || 'bg-muted text-muted-foreground border-border';

export const getStatusHexColor = (status: string): string =>
  STATUS_CONFIG[status]?.hexColor || '#6b7280';

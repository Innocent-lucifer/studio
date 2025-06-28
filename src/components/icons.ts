
import {
  Archive, ArchiveRestore, ArrowLeft, ArrowRight, Check, ChevronsUpDown, Copy, CreditCard, Edit, Eye,
  File, HelpCircle, Home, Lightbulb, ListChecks, Loader2, LogIn, LogOut, Mail, Menu, Moon,
  Plus, RefreshCw, Repeat, Save, Search, Share2, Shield, Sun, Trash, User, Wand2, Workflow,
  Twitter, Linkedin, Sparkles, CalendarDays, Send, Feather, CheckCircle, Lock, X, AlertTriangle, Info,
  Image as ImageIconLucide, Layers as LayersIcon, Tag, Filter as FilterIcon, Globe2, Flame,
  Briefcase, Heart, Smile, UploadCloud
} from 'lucide-react';
import type { SVGProps } from 'react';

// Define a general type for icon components that might take className
type IconComponent = (props: SVGProps<SVGSVGElement> & { className?: string }) => JSX.Element;

const Icons = {
  alertTriangle: AlertTriangle,
  archive: Archive,
  archiveRestore: ArchiveRestore,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  briefcase: Briefcase,
  calendar: CalendarDays,
  check: Check,
  checkCircle: CheckCircle,
  chevronDown: ChevronsUpDown,
  close: X,
  copy: Copy,
  creditCard: CreditCard,
  edit: Edit,
  eye: Eye,
  feather: Feather,
  file: File,
  filter: FilterIcon,
  flame: Flame,
  globe: Globe2,
  heart: Heart,
  help: HelpCircle,
  home: Home,
  image: ImageIconLucide,
  info: Info,
  layers: LayersIcon,
  light: Sun,
  lightbulb: Lightbulb,
  linkedin: Linkedin,
  listChecks: ListChecks,
  loader: Loader2,
  lock: Lock,
  logIn: LogIn,
  logOut: LogOut,
  mail: Mail,
  menu: Menu,
  moon: Moon,
  plus: Plus,
  refreshCw: RefreshCw,
  repeat: Repeat,
  save: Save,
  search: Search,
  send: Send,
  share: Share2,
  shield: Shield,
  smile: Smile,
  sparkles: Sparkles,
  spinner: Loader2,
  tag: Tag,
  trash: Trash,
  twitter: Twitter,
  upload: UploadCloud,
  user: User,
  wand: Wand2,
  workflow: Workflow,
};

export { Icons };
export type { IconComponent };

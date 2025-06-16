
import {
  ArrowLeft, ArrowRight, BarChartBig, Check, ChevronsUpDown, Circle, Copy, CreditCard, Edit, ExternalLink,
  File, HelpCircle, Home, Lightbulb, ListChecks, Loader2, LogIn, LogOut, Mail, Menu, MessageSquare, Moon,
  Plus, PlusCircle, RefreshCw, Repeat, Save, Search, Server, Settings, Share2, Shield, Sun, Trash, User,
  UserPlus, Wand2, Workflow, Twitter, Linkedin, Sparkles, CalendarDays, Send, Feather,
  CheckCircle, Lock, X, AlertTriangle, Info, Image as ImageIconLucide, Layers3, Tag, Filter as FilterIcon, Globe2, Flame,
  Briefcase, Heart, Smile, UploadCloud
} from 'lucide-react';
import type { SVGProps } from 'react';

// Define a general type for icon components that might take className
type IconComponent = (props: SVGProps<SVGSVGElement> & { className?: string }) => JSX.Element;


const Icons = {
  alertTriangle: AlertTriangle,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  barChartBig: BarChartBig,
  briefcase: Briefcase,
  calendar: CalendarDays,
  check: Check,
  checkCircle: CheckCircle,
  chevronDown: ChevronsUpDown, 
  circle: Circle,
  close: X,
  copy: Copy,
  creditCard: CreditCard,
  edit: Edit,
  externalLink: ExternalLink,
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
  layers: Layers3,
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
  messageSquare: MessageSquare,
  moon: Moon, 
  plus: Plus,
  plusCircle: PlusCircle,
  refreshCw: RefreshCw,
  repeat: Repeat,
  save: Save,
  search: Search,
  send: Send,
  server: Server,
  settings: Settings,
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
  userPlus: UserPlus,
  wand: Wand2,
  workflow: Workflow,
};

export { Icons };
export type { IconComponent };


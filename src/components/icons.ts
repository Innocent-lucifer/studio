
import {
  ArrowLeft, ArrowRight, BarChartBig, Check, ChevronsUpDown, Circle, Copy, CreditCard, Edit, ExternalLink,
  File, HelpCircle, Home, Lightbulb, ListChecks, Loader2, LogIn, LogOut, Mail, Menu, MessageSquare, Moon,
  Plus, PlusCircle, RefreshCw, Repeat, Save, Search, Server, Settings, Share2, Shield, Sun, Trash, User,
  UserPlus, Wand2, Workflow, Twitter, Linkedin, Sparkles, CalendarDays, Send, Feather,
  CheckCircle, Lock, X, AlertTriangle, Info, Image as ImageIconLucide, Layers3, Tag, Filter as FilterIcon, Globe2, Flame,
  Briefcase, Heart, Smile, UploadCloud
} from 'lucide-react';
import type { SVGProps } from 'react';

// Define a general type for icon components
// For the custom ones that are simplified, they might not take props.
type IconComponent = (props: SVGProps<SVGSVGElement> & { className?: string }) => JSX.Element;
type StaticIconComponent = () => JSX.Element;


// Define custom icon components explicitly before the Icons object
// These are simplified to take NO PROPS to avoid parsing errors.
// Basic styling like size should be applied where they are used or via a wrapper if needed.
function InstagramIconFC(): JSX.Element {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"> {/* Basic size */}
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.552 0-3.886.012-5.228.077-2.92.132-4.145 1.353-4.277 4.277-.065 1.342-.077 1.676-.077 5.228s.012 3.886.077 5.228c.132 2.92 1.357 4.145 4.277 4.277 1.342.065 1.676.077 5.228.077 3.552 0 3.886-.012 5.228-.077 2.92-.132 4.145-1.353 4.277-4.277.065-1.342.077-1.676.077-5.228s-.012-3.886-.077-5.228c-.132-2.92-1.352-4.145-4.277-4.277-1.342-.065-1.676-.077-5.228-.077zm0 4.136c-2.404 0-4.354 1.95-4.354 4.354s1.95 4.354 4.354 4.354 4.354-1.95 4.354-4.354-1.95-4.354-4.354-4.354zm0 6.907c-1.41 0-2.553-1.143-2.553-2.553s1.143-2.553 2.553-2.553 2.553 1.143 2.553 2.553-1.143 2.553-2.553 2.553zm4.966-6.963c-.774 0-1.402.628-1.402 1.402s.628 1.402 1.402 1.402 1.402-.628 1.402-1.402-.628-1.402-1.402-1.402z" />
    </svg>
  );
}

function TikTokIconFC(): JSX.Element {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5"> {/* Basic size */}
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.47.05-4.88-.88-6.49-2.91-1.43-1.8-1.89-4.07-1.57-6.29.12-1.07.43-2.12.87-3.11.49-1.06 1.14-2.07 1.93-2.91.01-1.48.01-2.96 0-4.44-.01-.79-.31-1.55-.84-2.12C4.16 5.84 3.39 5.5 2.64 5.25V1.2c1.78.36 3.49.96 5.06 1.78.58.3 1.12.66 1.62 1.07.02-1.3.01-2.59 0-3.89.01-.06.01-.11.02-.17.14-.58.46-1.1.91-1.48.49-.42 1.1-.64 1.75-.68V.02z" />
    </svg>
  );
}


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
  instagram: InstagramIconFC as StaticIconComponent, // Cast to StaticIconComponent
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
  // moon: Moon, // Assuming Moon might not be used or can be added later if needed
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
  tiktok: TikTokIconFC as StaticIconComponent, // Cast to StaticIconComponent
  trash: Trash,
  twitter: Twitter,
  upload: UploadCloud,
  user: User,
  userPlus: UserPlus,
  wand: Wand2,
  workflow: Workflow,
};

export { Icons };
export type { IconComponent, StaticIconComponent };

    
import * as React from 'react';
import { BarChart3, CreditCard, FileText, LogOut, Settings, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { useLocale } from '@/context/LocaleContext';
import { useNavigate } from 'react-router-dom';

export interface ProfileInfo {
  name: string;
  email: string;
  avatar?: string;
  subscription?: string;
  workspace?: string;
}

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ProfileInfo;
  onSignOut?: () => void;
}

function InitialAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <div className="h-11 w-11 rounded-full bg-[linear-gradient(135deg,#f97360,#ffda7a,#7dd3fc)] p-[1px]">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#07111d] text-sm font-bold text-white">
          {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : initials}
        </div>
      </div>
    </div>
  );
}

export function ProfileDropdown({ data, className, onSignOut, ...props }: ProfileDropdownProps) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const shortWorkspace = data.workspace && data.workspace.length > 28 ? `${data.workspace.slice(0, 28)}...` : data.workspace;

  const options = [
    { label: t('profileDropdown_profile', 'Profile'), onClick: () => navigate('/settings'), Icon: <UserRound className="h-4 w-4 text-[#8fd4ff]" /> },
    { label: data.workspace || t('profileDropdown_workspace', 'Workspace'), onClick: () => navigate('/dashboard'), Icon: <BarChart3 className="h-4 w-4 text-[#8fd4ff]" /> },
    { label: data.subscription || t('profileDropdown_plan', 'Plan'), onClick: () => navigate('/settings'), Icon: <CreditCard className="h-4 w-4 text-[#8fd4ff]" /> },
    { label: t('profileDropdown_settings', 'Settings'), onClick: () => navigate('/settings'), Icon: <Settings className="h-4 w-4 text-[#8fd4ff]" /> },
    { label: t('profileDropdown_docs', 'Docs'), onClick: () => window.open('https://21st.dev', '_blank'), Icon: <FileText className="h-4 w-4 text-[#8fd4ff]" /> },
    { label: t('profileDropdown_sign_out', 'Sign out'), onClick: onSignOut || (() => {}), Icon: <LogOut className="h-4 w-4 text-[#ef4444]" /> },
  ];

  return (
    <div className={cn('relative', className)} {...props}>
      <DropdownMenu options={options} className="flex min-w-[240px] items-center gap-3 rounded-[24px] border border-theme bg-theme-panel px-3 py-2 text-left transition-all duration-200 hover:border-theme hover:bg-theme-panel hover:shadow-[0_12px_40px_rgba(0,0,0,0.22)] focus:outline-none">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-theme">{data.name}</div>
          {shortWorkspace ? <div className="truncate text-xs text-theme-secondary">{shortWorkspace}</div> : null}
        </div>
        <InitialAvatar name={data.name} avatar={data.avatar} />
      </DropdownMenu>
    </div>
  );
}

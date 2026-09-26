import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import { UserProfile, UserRole } from '../types.ts';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  Edit3, 
  CheckCircle2, 
  X, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  Filter,
  ShieldAlert,
  ArrowLeft,
  Briefcase,
  Store,
  Crown
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const { 
    users, 
    branches, 
    currentUser, 
    isHQOwner,
    canAccessUserManagement,
    addUser, 
    updateUser, 
    switchUser, 
    t, 
    language 
  } = usePortal();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'hq_creative' as UserRole,
    branch_id: '',
    job_title: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  // Guard: ONLY Superadmin (HQ Owner) can check User Management
  if (!canAccessUserManagement) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 border border-red-200 dark:border-red-900/40 text-center max-w-xl mx-auto my-6 sm:my-12 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t('userManagementRestrictedTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          {t('userManagementRestrictedDesc')}
        </p>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setFormData({
      full_name: '',
      email: '',
      role: 'hq_creative',
      branch_id: '',
      job_title: language === 'ko' ? '그래픽 & 메뉴 디자이너' : 'Graphic & Menu Designer',
      phone: '',
      status: 'active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id || '',
      job_title: user.job_title || '',
      phone: user.phone || '',
      status: user.status || 'active'
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      setMessage({ 
        text: language === 'ko' ? '이름과 이메일을 입력하세요.' : 'Name and email are required.', 
        type: 'error' 
      });
      return;
    }

    const res = addUser({
      full_name: formData.full_name,
      email: formData.email,
      role: formData.role,
      branch_id: formData.role.startsWith('branch_') ? (formData.branch_id || branches[0].id) : null,
      job_title: formData.job_title,
      phone: formData.phone,
      status: formData.status
    });

    if (res.success) {
      setMessage({ text: t('userCreatedSuccess'), type: 'success' });
      setIsAddModalOpen(false);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      full_name: formData.full_name,
      email: formData.email,
      role: formData.role,
      branch_id: formData.role.startsWith('branch_') ? (formData.branch_id || branches[0].id) : null,
      job_title: formData.job_title,
      phone: formData.phone,
      status: formData.status
    });

    setMessage({ text: t('userUpdatedSuccess'), type: 'success' });
    setEditingUser(null);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.job_title && u.job_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = 
      selectedRoleFilter === 'all' || 
      u.role === selectedRoleFilter ||
      (selectedRoleFilter === 'hq_all' && (u.role === 'hq_owner' || u.role === 'hq_leader' || u.role === 'hq_creative' || u.role === 'pusat_admin')) ||
      (selectedRoleFilter === 'branch_all' && (u.role === 'branch_owner' || u.role === 'branch_manager'));

    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'hq_owner':
      case 'pusat_admin':
        return t('role_hq_owner');
      case 'hq_leader':
        return t('role_hq_leader');
      case 'hq_creative':
        return t('role_hq_creative');
      case 'branch_owner':
        return t('role_branch_owner');
      case 'branch_manager':
        return t('role_branch_manager');
      default:
        return role;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
                  {t('userManagementTitle')}
                </h1>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                  Superadmin Only
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {t('userManagementSubtitle')}
              </p>
            </div>
          </div>

          {/* Strict Hierarchy Banner Indicator */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-700/80 text-xs text-amber-300 space-y-1 mt-3 md:mt-0">
            <div className="flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold">{t('hierarchyHq')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{t('hierarchyBranch')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('registerUserBtn')}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm font-medium border flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
            : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs font-bold underline ml-3 cursor-pointer">
            {t('close')}
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchUsersPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-amber-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs rounded-xl border-slate-200 dark:border-slate-700 border py-2 px-3 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">{t('allRoles')}</option>
            <option value="hq_all">HQ All (Owner, Leader &amp; Creative)</option>
            <option value="hq_owner">HQ Owner (Super Admin)</option>
            <option value="hq_leader">HQ Leader / Creative Director</option>
            <option value="hq_creative">HQ Creative Team (Designer/Editor)</option>
            <option value="branch_all">Branch All (Owners &amp; Managers)</option>
            <option value="branch_owner">Branch Owner Only</option>
            <option value="branch_manager">Branch Store Manager Only</option>
          </select>

          <span className="text-xs font-semibold text-slate-400 ml-auto sm:ml-2">
            {filteredUsers.length} {language === 'ko' ? '명' : 'users'}
          </span>
        </div>
      </div>

      {/* User Table (Responsive scroll) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('fullName')}</th>
                <th className="py-3 px-4">{t('role')}</th>
                <th className="py-3 px-4">{t('branch')}</th>
                <th className="py-3 px-4">{t('jobTitle')}</th>
                <th className="py-3 px-4">{t('accountStatus')}</th>
                <th className="py-3 px-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredUsers.map((user) => {
                const branchObj = branches.find((b) => b.id === user.branch_id);
                const isCurrent = currentUser.id === user.id;

                return (
                  <tr key={user.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition ${isCurrent ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}`}>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{user.full_name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        user.role === 'hq_owner' || user.role === 'pusat_admin'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : user.role === 'hq_leader'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : user.role === 'hq_creative'
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : user.role === 'branch_owner'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                      }`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {branchObj ? (
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{branchObj.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">HQ (Bali Center)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {user.job_title || '-'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        user.status === 'active' || !user.status
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title={t('edit')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => switchUser(user.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                          title="Switch active user session"
                        >
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          <span>{language === 'ko' ? '전환' : 'Switch'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Register Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <span>{t('addNewUserTitle')}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('fullName')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ji-won Park or Wayan Sudarma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('emailAddress')}</label>
                <input
                  type="email"
                  required
                  placeholder="user@moggumung.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('selectRole')}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="hq_owner">HQ Owner (Super Admin)</option>
                    <option value="hq_leader">HQ Leader / Creative Lead</option>
                    <option value="hq_creative">HQ Creative (Designer/Video)</option>
                    <option value="branch_owner">Branch Owner (Franchisee)</option>
                    <option value="branch_manager">Branch Store Manager</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('accountStatus')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="active">{t('statusActive')}</option>
                    <option value="inactive">{t('statusInactive')}</option>
                    <option value="suspended">{t('statusSuspended')}</option>
                  </select>
                </div>
              </div>

              {formData.role.startsWith('branch_') && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('selectBranch')}</label>
                  <select
                    value={formData.branch_id || branches[0]?.id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('jobTitle')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Designer or Store GM"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    placeholder="+62 812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {t('saveUser')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>{t('editUserTitle')}</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('fullName')}</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('emailAddress')}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('selectRole')}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="hq_owner">HQ Owner (Super Admin)</option>
                    <option value="hq_leader">HQ Leader / Creative Lead</option>
                    <option value="hq_creative">HQ Creative (Designer/Video)</option>
                    <option value="branch_owner">Branch Owner (Franchisee)</option>
                    <option value="branch_manager">Branch Store Manager</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('accountStatus')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="active">{t('statusActive')}</option>
                    <option value="inactive">{t('statusInactive')}</option>
                    <option value="suspended">{t('statusSuspended')}</option>
                  </select>
                </div>
              </div>

              {formData.role.startsWith('branch_') && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('selectBranch')}</label>
                  <select
                    value={formData.branch_id || branches[0]?.id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('jobTitle')}</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {t('saveUser')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

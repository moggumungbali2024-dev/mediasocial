import { 
  Branch, 
  UserProfile, 
  MonthlyQuota, 
  DesignRequest, 
  PromoRequest, 
  Invoice, 
  ExposureSlot, 
  Influencer,
  ActivityItem,
  CustomLineItem,
  WhitelabelConfig,
  AttendanceRecord,
  BudgetRequest,
  ShootRequest,
  WalletTransaction,
  InfluencerVoucherCampaign,
  HqReimbursementRequest,
  HqTodoItem,
  TeamChatMessage,
  MeetingAgenda,
  BrandSubscriptionPlan,
  PlatformBrandTenant,
  PlatformWalletWithdrawal,
  SubscriptionReminderLog
} from '../types.ts';

export const DEFAULT_WHITELABEL_CONFIG: WhitelabelConfig = {
  brand_name: 'Moggumung',
  brand_subtitle: 'Social Media Management & Quota Portal',
  brand_monogram: 'MG',
  brand_logo_url: '',
  theme_accent: 'kinetic_orange',
  custom_primary_hex: '#FF5B14',
  company_legal_name: 'PT Moggumung Boga Nusantara',
  hq_location: 'Bali HQ (Sunset Road)',
  hq_address: 'Jl. Sunset Road No. 88, Seminyak, Kuta, Bali 80361',
  contact_email: 'moggumung.bali2024@gmail.com',
  contact_whatsapp: '+62 812-9988-7766',
  bank_name: 'Bank Central Asia (BCA)',
  bank_account_number: '772-098-1123',
  bank_account_name: 'PT Moggumung Boga Nusantara',
  bank_swift_code: 'CENAIDJA',
  invoice_note_footer: 'Pembayaran wajib diselesaikan dalam 7 hari kalender setelah tanggal terbit invoice. Harap cantumkan Nomor Invoice pada berita transfer.',
  currency_symbol: 'Rp',
  default_monthly_retainer: 5000000,
  max_monthly_design_requests: 3,
  max_monthly_active_promos: 2,
  design_min_lead_days: 5,
  promo_cutoff_day_of_month: 25
};

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-ubud',
    name: 'Moggumung Ubud',
    code: 'UBD',
    location: 'Jl. Hanoman No. 42, Ubud',
    city: 'Gianyar, Bali',
    address: 'Jl. Hanoman No. 42, Padangtegal, Ubud, Kabupaten Gianyar, Bali 80571',
    contract_status: 'active',
    contact_person: 'Budi Santoso',
    phone: '+62 812-3456-7890',
    created_at: '2025-11-15',
    custom_retainer_fee: 5000000,
    package_tier: 'Standard',
    wallet_balance: 6500000,
    max_monthly_design_requests: 12,
    max_monthly_active_promos: 4,
    lead_days: 5,
    pic_name: 'Gede Sukerta (Store Manager)',
    pic_phone: '0812-9999-0008',
    pic_email: 'store.ubud@moggumung.com',
    owner_name: 'Budi Santoso (Owner Ubud)',
    owner_phone: '0812-9999-0007',
    owner_email: 'budi.santoso@moggumung.com'
  },
  {
    id: 'branch-seminyak',
    name: 'Moggumung Seminyak',
    code: 'SMY',
    location: 'Jl. Kayu Aya No. 88, Seminyak',
    city: 'Badung, Bali',
    address: 'Jl. Kayu Aya No. 88, Oberoi, Seminyak, Kuta, Kabupaten Badung, Bali 80361',
    contract_status: 'active',
    contact_person: 'Sarah Wijaya',
    phone: '+62 813-9876-5432',
    created_at: '2026-01-10',
    custom_retainer_fee: 6500000,
    package_tier: 'Premium',
    wallet_balance: 12000000,
    max_monthly_design_requests: 15,
    max_monthly_active_promos: 6,
    lead_days: 4,
    pic_name: 'Ketut Suardana (Store Manager)',
    pic_phone: '0812-9999-0006',
    pic_email: 'store.seminyak@moggumung.com',
    owner_name: 'Wayan Sudirta (Owner Seminyak)',
    owner_phone: '0812-9999-0005',
    owner_email: 'wayan.sudirta@moggumung.com'
  },
  {
    id: 'branch-canggu',
    name: 'Moggumung Canggu',
    code: 'CGU',
    location: 'Jl. Pantai Batu Bolong No. 19',
    city: 'Badung, Bali',
    address: 'Jl. Pantai Batu Bolong No. 19, Canggu, Kuta Utara, Badung, Bali 80351',
    contract_status: 'active',
    contact_person: 'Wayan Ardi',
    phone: '+62 811-2233-4455',
    created_at: '2026-02-01',
    custom_retainer_fee: 5000000,
    package_tier: 'Standard',
    wallet_balance: 4500000,
    max_monthly_design_requests: 10,
    max_monthly_active_promos: 4,
    lead_days: 5,
    pic_name: 'Kadek Wira (Store Manager)',
    pic_phone: '0812-9999-0010',
    pic_email: 'store.canggu@moggumung.com',
    owner_name: 'Putu Astawa (Owner Canggu)',
    owner_phone: '0812-9999-0009',
    owner_email: 'putu.astawa@moggumung.com'
  },
  {
    id: 'branch-bandung',
    name: 'Moggumung Bandung',
    code: 'BDG',
    location: 'Jl. R.E. Martadinata (Riau) No. 112',
    city: 'Bandung, Jawa Barat',
    address: 'Jl. L. L. R.E. Martadinata No. 112, Cihapit, Kec. Bandung Wetan, Kota Bandung 40114',
    contract_status: 'active',
    contact_person: 'Reza Pratama',
    phone: '+62 821-4567-8901',
    created_at: '2026-04-18',
    custom_retainer_fee: 4500000,
    package_tier: 'Starter',
    wallet_balance: 3000000,
    max_monthly_design_requests: 8,
    max_monthly_active_promos: 3,
    lead_days: 5,
    pic_name: 'Rudi Hermawan (Store Manager)',
    pic_phone: '0821-4567-8901',
    pic_email: 'store.bandung@moggumung.com',
    owner_name: 'Reza Pratama (Owner Bandung)',
    owner_phone: '0821-4567-8900',
    owner_email: 'reza.bandung@moggumung.com'
  },
  {
    id: 'branch-senopati',
    name: 'Moggumung Senopati',
    code: 'SNP',
    location: 'Jl. Suryo No. 27, Senopati',
    city: 'Jakarta Selatan',
    address: 'Jl. Suryo No. 27, RW.3, Rw. Bar., Kec. Kby. Baru, Kota Jakarta Selatan 12180',
    contract_status: 'active',
    contact_person: 'Dewi Lestari',
    phone: '+62 818-7654-3210',
    created_at: '2026-06-01',
    custom_retainer_fee: 7000000,
    package_tier: 'Custom',
    wallet_balance: 8000000,
    max_monthly_design_requests: 15,
    max_monthly_active_promos: 5,
    lead_days: 4,
    pic_name: 'Dimas Setiawan (Store Manager)',
    pic_phone: '0818-7654-3210',
    pic_email: 'store.senopati@moggumung.com',
    owner_name: 'Dewi Lestari (Owner Senopati)',
    owner_phone: '0818-7654-3211',
    owner_email: 'dewi.senopati@moggumung.com'
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-platform-owner',
    branch_id: null,
    role: 'platform_owner',
    full_name: 'Platform Superadmin',
    email: 'owner@mediasocial.team',
    job_title: 'Founder & Platform Superadmin (mediasocial.team)',
    status: 'active',
    phone: '08159998757',
    password: 'Media',
    joined_date: '2024-01-01'
  },
  {
    id: 'user-pusat',
    branch_id: null,
    role: 'hq_owner',
    full_name: 'Min-jun Kim',
    email: 'moggumung.bali2024@gmail.com',
    job_title: 'Brand Owner / Super Admin',
    status: 'active',
    phone: '0812-9999-0001',
    password: 'Media',
    joined_date: '2024-01-01'
  },
  {
    id: 'user-leader',
    branch_id: null,
    role: 'hq_leader',
    full_name: 'Joon-ho Lee (HQ Creative Director & Lead)',
    email: 'joonho.lead@moggumung.com',
    job_title: 'Creative Director & Operations Lead',
    status: 'active',
    phone: '0812-9999-0002',
    password: 'Media',
    joined_date: '2024-06-01'
  },
  {
    id: 'user-creative-1',
    branch_id: null,
    role: 'hq_creative',
    full_name: 'Ji-won Park (Art Director & Creative)',
    email: 'jiwon.creative@moggumung.com',
    job_title: 'Lead Graphic & Menu Designer',
    status: 'active',
    phone: '0812-9999-0003',
    password: 'Media',
    joined_date: '2025-02-15'
  },
  {
    id: 'user-creative-2',
    branch_id: null,
    role: 'hq_creative',
    full_name: 'Dewa Aditya (Video Editor & Motion)',
    email: 'dewa.motion@moggumung.com',
    job_title: 'Video Editor & Content Creator',
    status: 'active',
    phone: '0812-9999-0004',
    password: 'Media',
    joined_date: '2025-06-01'
  },
  {
    id: 'user-ubud',
    branch_id: 'branch-ubud',
    role: 'branch_owner',
    full_name: 'Budi Santoso (Owner Ubud)',
    email: 'ubud@moggumung.com',
    job_title: 'Franchise Owner Ubud',
    status: 'active',
    phone: '0812-9999-0005',
    password: 'Media',
    joined_date: '2025-11-15'
  },
  {
    id: 'user-mgr-ubud',
    branch_id: 'branch-ubud',
    role: 'branch_manager',
    full_name: 'Putu Pratama (Manager Ubud)',
    email: 'putu.mgr@moggumung.com',
    job_title: 'Store Operations Manager Ubud',
    status: 'active',
    phone: '0812-9999-0006',
    password: 'Media',
    joined_date: '2025-12-01'
  },
  {
    id: 'user-seminyak',
    branch_id: 'branch-seminyak',
    role: 'branch_owner',
    full_name: 'Sarah Wijaya (Owner Seminyak)',
    email: 'seminyak@moggumung.com',
    job_title: 'Franchise Owner Seminyak',
    status: 'active',
    phone: '0812-9999-0007',
    password: 'Media',
    joined_date: '2026-01-10'
  },
  {
    id: 'user-mgr-seminyak',
    branch_id: 'branch-seminyak',
    role: 'branch_manager',
    full_name: 'Kevin Pratama (Manager Seminyak)',
    email: 'kevin.mgr@moggumung.com',
    job_title: 'Store Operations Manager Seminyak',
    status: 'active',
    phone: '0812-9999-0008',
    password: 'Media',
    joined_date: '2026-02-01'
  },
  {
    id: 'user-canggu',
    branch_id: 'branch-canggu',
    role: 'branch_owner',
    full_name: 'Wayan Ardi (Owner Canggu)',
    email: 'canggu@moggumung.com',
    job_title: 'Franchise Owner Canggu',
    status: 'active',
    phone: '0812-9999-0009',
    password: 'Media',
    joined_date: '2026-02-01'
  },
  {
    id: 'user-bandung',
    branch_id: 'branch-bandung',
    role: 'branch_owner',
    full_name: 'Reza Pratama (Owner Bandung)',
    email: 'bandung@moggumung.com',
    job_title: 'Franchise Owner Bandung',
    status: 'active',
    phone: '0812-9999-0010',
    password: 'Media',
    joined_date: '2026-04-18'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-01',
    user_id: 'user-creative-1',
    user_name: 'Ji-won Park',
    date: '2026-09-21',
    clock_in_time: '08:45',
    clock_out_time: '17:30',
    mode: 'WFO',
    status: 'completed',
    work_log: 'Completed Autumn Truffle poster for Ubud branch, revised Seminyak Happy Hour flyer, reviewed 2 briefs.',
    total_hours: 8.75
  },
  {
    id: 'att-02',
    user_id: 'user-creative-2',
    user_name: 'Dewa Aditya',
    date: '2026-09-21',
    clock_in_time: '09:05',
    mode: 'On-Site Visit',
    status: 'present',
    target_branch_id: 'branch-canggu',
    work_log: 'Photoshoot & video capture at Moggumung Canggu for October Reels campaign. Captured 18 b-roll clips of Ramen sizzle.',
    total_hours: 7.5
  },
  {
    id: 'att-03',
    user_id: 'user-creative-1',
    user_name: 'Ji-won Park',
    date: '2026-09-20',
    clock_in_time: '08:50',
    clock_out_time: '17:15',
    mode: 'WFH',
    status: 'completed',
    work_log: 'Designed Bandung Spicy Tori Paitan feed carousel, prepared export packages for print table mats.',
    total_hours: 8.4
  }
];

export const INITIAL_QUOTAS: MonthlyQuota[] = [
  {
    id: 'quota-ubud-2026-09',
    branch_id: 'branch-ubud',
    period_month: '2026-09',
    design_used: 1, // 1 of 3 used
    promo_used: 1   // 1 of 2 used
  },
  {
    id: 'quota-seminyak-2026-09',
    branch_id: 'branch-seminyak',
    period_month: '2026-09',
    design_used: 2, // 2 of 3 used
    promo_used: 2   // 2 of 2 used (Full)
  },
  {
    id: 'quota-canggu-2026-09',
    branch_id: 'branch-canggu',
    period_month: '2026-09',
    design_used: 0,
    promo_used: 0
  },
  {
    id: 'quota-bandung-2026-09',
    branch_id: 'branch-bandung',
    period_month: '2026-09',
    design_used: 3, // 3 of 3 used (Full)
    promo_used: 1
  },
  {
    id: 'quota-senopati-2026-09',
    branch_id: 'branch-senopati',
    period_month: '2026-09',
    design_used: 1,
    promo_used: 0
  }
];

export const INITIAL_DESIGN_REQUESTS: DesignRequest[] = [
  {
    id: 'req-01',
    branch_id: 'branch-ubud',
    title: 'Poster Menu Spesial Autumn Truffle Ramen',
    description: 'Format Story dan Feed Carousel 1080x1350. Tampilkan foto hero bowl Truffle Ramen dengan tone warm earthy khas Ubud.',
    target_date: '2026-09-28',
    status: 'in_progress',
    category: 'Food',
    preview_media_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    preview_media_type: 'image',
    canva_url: 'https://www.canva.com/design/DAGmoggumung-ubud-truffle',
    figma_url: 'https://www.figma.com/file/moggumung-autumn-menu',
    drive_url: 'https://drive.google.com/drive/folders/moggumung-ubud-final-assets',
    caption: '🍂 Nikmati kehangatan Autumn Truffle Ramen spesial hanya di Moggumung Ubud! Perpaduan kaldu gurih dengan truffle oil pilihan.\n\n📍 Jl. Hanoman No. 42, Ubud, Gianyar, Bali\n⏰ Buka Setiap Hari: 10:00 - 22:00 WITA\n\n#moggumung #ubudeats #balifoodies #truffleramen #japaneseramen',
    brief_attachment_name: 'brief_truffle_ubud.pdf',
    created_at: '2026-09-18',
    assigned_to_user_id: 'user-creative-1',
    assigned_to_name: 'Ji-won Park',
    creative_notes: 'Drafting typography in Figma. Tone palette: earthy brown & golden broth highlights.',
    comments: [
      {
        id: 'comm-1',
        request_id: 'req-01',
        user_id: 'user-mgr-ubud',
        user_name: 'Putu Pratama (Manager Ubud)',
        user_role: 'branch_manager',
        message: 'Halo tim HQ, tolong pastikan font harga dibuat kontras ya agar mudah dibaca di story.',
        tag: 'Revisi Desain',
        created_at: '2026-09-19 10:15'
      },
      {
        id: 'comm-2',
        request_id: 'req-01',
        user_id: 'user-creative-1',
        user_name: 'Ji-won Park (Art Director)',
        user_role: 'hq_creative',
        message: 'Siap Pak Putu! Kami gunakan gold highlight dengan outline tipis agar tetap elegan.',
        tag: 'Format File',
        created_at: '2026-09-19 11:30'
      }
    ]
  },
  {
    id: 'req-02',
    branch_id: 'branch-seminyak',
    title: 'Flyer Sunset Happy Hour Cocktail & Gyoza',
    description: 'Promo jam 17:00 - 19:00 WITA. Desain modern vibrant aesthetic untuk audience ekspatriat dan tourist Seminyak.',
    target_date: '2026-09-27',
    status: 'approved',
    category: 'Promo',
    asset_result_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    preview_media_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    preview_media_type: 'image',
    canva_url: 'https://www.canva.com/design/DAGseminyak-happyhour',
    drive_url: 'https://drive.google.com/drive/folders/seminyak-happyhour-pack',
    caption: '🌅 Catch the golden hour with our exclusive Sunset Gyoza & Craft Cocktail Pairing! Available daily 17:00 - 19:00 WITA.\n\n📍 Jl. Kayu Aya No. 88, Seminyak, Bali\n👉 Tag your sunset crew!\n\n#moggumung #seminyakeats #balinightlife #sunsetcocktails #balifoodies',
    brief_attachment_name: 'seminyak_happyhour_assets.zip',
    created_at: '2026-09-15',
    assigned_to_user_id: 'user-creative-1',
    assigned_to_name: 'Ji-won Park',
    creative_notes: 'Final export delivered in 1080x1920 9:16 and 1080x1080 1:1.',
    comments: [
      {
        id: 'comm-3',
        request_id: 'req-02',
        user_id: 'user-seminyak',
        user_name: 'Sarah Wijaya (Owner Seminyak)',
        user_role: 'branch_owner',
        message: 'Hasilnya keren banget tim! Sudah kami unduh dan jadwalkan di Meta Ads.',
        tag: 'Siap Tayang',
        created_at: '2026-09-17 14:20'
      }
    ]
  },
  {
    id: 'req-03',
    branch_id: 'branch-seminyak',
    title: 'Banner Recruitment Kitchen Crew & Barista',
    description: 'Kebutuhan lowongan barista berpengalaman dan cook helper untuk cabang Seminyak. Style typography tegas & clean.',
    target_date: '2026-09-29',
    status: 'pending',
    category: 'Creative',
    brief_attachment_name: 'syarat_loker_crew.docx',
    created_at: '2026-09-20',
    comments: []
  },
  {
    id: 'req-04',
    branch_id: 'branch-bandung',
    title: 'Announcement Cuaca Dingin: Spicy Tori Paitan',
    description: 'Feed reels cover + story. Mengangkat angle cuaca sejuk Bandung paling nikmat kuah pedas kental.',
    target_date: '2026-09-27',
    status: 'approved',
    category: 'Food',
    asset_result_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    preview_media_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    preview_media_type: 'image',
    caption: '🌧️ Hawa dingin Bandung paling pas dihajar kuah kental gurih Spicy Tori Paitan!\n\n📍 Jl. R.E. Martadinata (Riau) No. 112, Bandung\n⏰ Buka 11:00 - 22:00 WIB\n\n#moggumungbandung #kulinerbandung #bandungfoodies #spicyramen',
    created_at: '2026-09-12',
    assigned_to_user_id: 'user-creative-2',
    assigned_to_name: 'Dewa Aditya',
    creative_notes: 'Color graded steam clips, text overlay synchronized with music beat.',
    comments: []
  },
  {
    id: 'req-05',
    branch_id: 'branch-bandung',
    title: 'Table Mat & QR Menu Tabletop Design',
    description: 'Desain alas meja ukuran A3 dan acrylic standee untuk scan nomor meja dan Instagram.',
    target_date: '2026-09-30',
    status: 'in_progress',
    category: 'Creative',
    created_at: '2026-09-16',
    assigned_to_user_id: 'user-creative-2',
    assigned_to_name: 'Dewa Aditya',
    creative_notes: 'A3 vector print file configured with 3mm bleed in CMYK.',
    comments: []
  },
  {
    id: 'req-06',
    branch_id: 'branch-bandung',
    title: 'Story Ads Flash Sale Payday 25-27 September',
    description: 'Diskon 20% all ramen untuk follower Instagram. Butuh 3 slides story format 9:16.',
    target_date: '2026-09-26',
    status: 'rejected',
    category: 'Promo',
    feedback_notes: 'Format aset mentah belum lengkap dan resolusi foto kurang tajam. Mohon koordinasi ulang dengan fotografer lokal.',
    created_at: '2026-09-17',
    comments: []
  }
];

export const INITIAL_PROMOS: PromoRequest[] = [
  {
    id: 'prm-01',
    branch_id: 'branch-ubud',
    title: 'Ubud Foodie Pass: Free Matcha Pudding',
    mechanic: 'Free Matcha Silk Pudding dengan minimal order 2 Special Bowl Ramen.',
    target_month: '2026-09',
    start_date: '2026-09-22',
    end_date: '2026-09-30',
    terms: 'Hanya dine-in di Moggumung Ubud. Wajib follow Instagram & mention story.',
    status: 'active',
    created_at: '2026-09-10'
  },
  {
    id: 'prm-02',
    branch_id: 'branch-seminyak',
    title: 'Sunset Gyoza Bundle 2+1',
    mechanic: 'Beli 2 porsi Crispy Gyoza gratis 1 Cold Oolong Tea.',
    target_month: '2026-09',
    start_date: '2026-09-15',
    end_date: '2026-09-30',
    terms: 'Berlaku setiap hari pukul 16:00 - 19:00 WITA.',
    status: 'active',
    created_at: '2026-09-08'
  },
  {
    id: 'prm-03',
    branch_id: 'branch-seminyak',
    title: 'Digital Nomad Lunch Combo',
    mechanic: 'Paket Ramen + Coffee Refill Rp79.000 nett.',
    target_month: '2026-09',
    start_date: '2026-09-01',
    end_date: '2026-09-30',
    terms: 'Berlaku Senin - Jumat pukul 11:00 - 15:00 WITA.',
    status: 'active',
    created_at: '2026-08-28'
  },
  {
    id: 'prm-04',
    branch_id: 'branch-bandung',
    title: 'Student ID Weekday Discount 15%',
    mechanic: 'Tunjukkan kartu mahasiswa (ITB, UNPAR, UNPAD) diskon 15% bill.',
    target_month: '2026-09',
    start_date: '2026-09-10',
    end_date: '2026-09-30',
    terms: 'Tidak dapat digabung dengan promo lain. Maksimal 1 bill per kartu.',
    status: 'active',
    created_at: '2026-09-05'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-2026-09-ubud',
    branch_id: 'branch-ubud',
    invoice_number: 'INV/MGG/2026/09/001',
    period_month: '2026-09-01',
    retainer_fee: 5000000,
    visit_fee: 1500000, // Onsite photoshoot di Ubud
    ad_budget: 1000000, // Meta Ads deposit
    custom_items: [
      { id: 'ci-1', name: 'Cetak Standee Promo Akrilik Meja (10 pcs)', amount: 450000 }
    ],
    additional_notes: 'Termasuk 1x onsite content shoot kreator Bali ke Moggumung Ubud + cetak standee promo.',
    total_amount: 7950000,
    status: 'proof_uploaded',
    due_date: '2026-09-10',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    proof_notes: 'Transfer via BCA Rp7.950.000 an PT Moggumung Bali Kreasi, Ref #98231',
    created_at: '2026-09-01'
  },
  {
    id: 'inv-2026-09-seminyak',
    branch_id: 'branch-seminyak',
    invoice_number: 'INV/MGG/2026/09/002',
    period_month: '2026-09-01',
    retainer_fee: 6500000, // Custom Premium Tier
    visit_fee: 0,
    ad_budget: 2000000, // High tourist ads budget
    custom_items: [
      { id: 'ci-2', name: 'Diskon Loyalty Partner Seminyak', amount: -500000 }
    ],
    additional_notes: 'Paket Premium Retainer + Iklan Instagram & TikTok Ads khusus tourist area Seminyak/Canggu.',
    total_amount: 8000000,
    status: 'paid',
    due_date: '2026-09-10',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    payment_date: '2026-09-04',
    created_at: '2026-09-01'
  },
  {
    id: 'inv-2026-09-bandung',
    branch_id: 'branch-bandung',
    invoice_number: 'INV/MGG/2026/09/003',
    period_month: '2026-09-01',
    retainer_fee: 5000000,
    visit_fee: 2500000, // Tiket & akomodasi tim supervisi Bali ke Bandung
    ad_budget: 1500000,
    additional_notes: 'Supervisi tim creative Bali untuk pembukaan menu baru Bandung.',
    total_amount: 9000000,
    status: 'paid',
    due_date: '2026-09-10',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    payment_date: '2026-09-05',
    created_at: '2026-09-01'
  },
  {
    id: 'inv-2026-09-canggu',
    branch_id: 'branch-canggu',
    invoice_number: 'INV/MGG/2026/09/004',
    period_month: '2026-09-01',
    retainer_fee: 5000000,
    visit_fee: 0,
    ad_budget: 1000000,
    total_amount: 6000000,
    status: 'unpaid',
    due_date: '2026-09-10',
    created_at: '2026-09-01'
  },
  {
    id: 'inv-2026-09-senopati',
    branch_id: 'branch-senopati',
    invoice_number: 'INV/MGG/2026/09/005',
    period_month: '2026-09-01',
    retainer_fee: 5000000,
    visit_fee: 0,
    ad_budget: 2500000,
    total_amount: 7500000,
    status: 'overdue',
    due_date: '2026-09-10',
    created_at: '2026-09-01'
  }
];

export const INITIAL_EXPOSURE_SLOTS: ExposureSlot[] = [
  // 40% Food (8 slots), 25% Vibes (5 slots), 20% Creative (4 slots), 15% Promo (3 slots) = 20 total
  {
    id: 'exp-01',
    branch_id: 'branch-ubud',
    date: '2026-09-22',
    pillar: 'Food',
    format: 'Reels',
    title: 'Slow Cooking 16-Hour Rich Broth Signature',
    caption_outline: 'Rahasia kekayaan kaldu khas Moggumung yang dimasak perlahan setiap fajar di Ubud.',
    status: 'scheduled'
  },
  {
    id: 'exp-02',
    branch_id: 'branch-seminyak',
    date: '2026-09-23',
    pillar: 'Vibes',
    format: 'Feed Carousel',
    title: 'Golden Hour Ramen Session at Seminyak',
    caption_outline: 'Saat matahari mulai terbenam, suasana bar Jepang modern kami mulai menyala hangat.',
    status: 'scheduled'
  },
  {
    id: 'exp-03',
    branch_id: 'branch-bandung',
    date: '2026-09-24',
    pillar: 'Food',
    format: 'Single Post',
    title: 'Chashu Melt: Torched to Perfection',
    caption_outline: 'Aroma smokey chashu yang gurih lumer di lidah, paduan tepat untuk dinginnya hawa Bandung.',
    status: 'scheduled'
  },
  {
    id: 'exp-04',
    branch_id: 'branch-ubud',
    date: '2026-09-25',
    pillar: 'Promo',
    format: 'Story Highlights',
    title: 'Payday Treats Ubud: Free Silk Matcha',
    caption_outline: 'Khusus minggu gajian! Free dessert untuk setiap 2 mangkuk ramen.',
    status: 'scheduled'
  },
  {
    id: 'exp-05',
    branch_id: 'branch-canggu',
    date: '2026-09-26',
    pillar: 'Creative',
    format: 'Reels',
    title: 'Slurp Etiquette: How Japanese Really Eat Noodles',
    caption_outline: 'Edu-entertainment: Mengapa menyeruput ramen dengan bersuara adalah bentuk apresiasi untuk koki.',
    status: 'scheduled'
  },
  {
    id: 'exp-06',
    branch_id: 'branch-seminyak',
    date: '2026-09-27',
    pillar: 'Food',
    format: 'Feed Carousel',
    title: 'Side Dishes That Steal The Spotlight',
    caption_outline: 'Karage renyah, Gyoza juicy, dan Edamame dengan seasalt pilihan.',
    status: 'scheduled'
  },
  {
    id: 'exp-07',
    branch_id: 'branch-senopati',
    date: '2026-09-28',
    pillar: 'Vibes',
    format: 'Reels',
    title: 'After Office Decompression at Senopati Bar',
    caption_outline: 'Tempat pelarian paling tenang sehabis hiruk pikuk SCBD Jakarta.',
    status: 'scheduled'
  },
  {
    id: 'exp-08',
    branch_id: 'branch-bandung',
    date: '2026-09-29',
    pillar: 'Food',
    format: 'Single Post',
    title: 'Handmade Fresh Noodles Everyday',
    caption_outline: 'Tekstur kenyal dan al dente yang pas di setiap gigitan.',
    status: 'scheduled'
  },
  {
    id: 'exp-09',
    branch_id: 'branch-ubud',
    date: '2026-09-30',
    pillar: 'Creative',
    format: 'Feed Carousel',
    title: 'Behind the Design: The Zen Architecture of Ubud',
    caption_outline: 'Menyelaraskan kayu jati lokal dengan filosofi minimalis Tokyo.',
    status: 'scheduled'
  },
  {
    id: 'exp-10',
    branch_id: 'branch-seminyak',
    date: '2026-09-21',
    pillar: 'Promo',
    format: 'Reels',
    title: 'Sunset Happy Hour 17:00 - 19:00 Launch',
    caption_outline: 'Promo bundling sunset gyoza resmi dimulai hari ini!',
    status: 'published'
  },
  {
    id: 'exp-11',
    branch_id: 'branch-bandung',
    date: '2026-09-20',
    pillar: 'Food',
    format: 'Feed Carousel',
    title: 'Spicy Tori Paitan: Level 1 vs Level 3',
    caption_outline: 'Uji nyali pedas ramen Bandung, kamu tim kuah original creamy atau spicy berani?',
    status: 'published'
  },
  {
    id: 'exp-12',
    branch_id: 'branch-canggu',
    date: '2026-09-19',
    pillar: 'Vibes',
    format: 'Reels',
    title: 'Post-Surf Meal in Batu Bolong',
    caption_outline: 'Isi ulang energi sehabis menaklukan ombak Canggu dengan comfort bowl hangat.',
    status: 'published'
  },
  {
    id: 'exp-13',
    branch_id: 'branch-senopati',
    date: '2026-09-18',
    pillar: 'Food',
    format: 'Single Post',
    title: 'Truffle Oil Infusion: Luxury in a Spoon',
    caption_outline: 'Aroma truffle eropa berpadu dengan kaldu ramen otentik jepang.',
    status: 'published'
  },
  {
    id: 'exp-14',
    branch_id: 'branch-ubud',
    date: '2026-09-17',
    pillar: 'Vibes',
    format: 'Story Highlights',
    title: 'Rainy Afternoon in Ubud Haven',
    caption_outline: 'Hujan rintik di tengah alam Ubud dan semangkuk kuah panas mengepul.',
    status: 'published'
  },
  {
    id: 'exp-15',
    branch_id: 'branch-canggu',
    date: '2026-09-16',
    pillar: 'Creative',
    format: 'Single Post',
    title: 'Moggumung Secret Menu: Ask Your Server',
    caption_outline: 'Ada variasi rahasia yang tidak tertulis di buku menu reguler.',
    status: 'published'
  },
  {
    id: 'exp-16',
    branch_id: 'branch-seminyak',
    date: '2026-09-15',
    pillar: 'Food',
    format: 'Reels',
    title: 'Ajitsuke Tamago: The Custardy Egg Perfection',
    caption_outline: 'Telur rendam mirin dan shoyu dengan kuning telur yang meleleh lembut.',
    status: 'published'
  },
  {
    id: 'exp-17',
    branch_id: 'branch-bandung',
    date: '2026-09-14',
    pillar: 'Promo',
    format: 'Story Highlights',
    title: 'Student Card Monday Boost',
    caption_outline: 'Khusus hari Senin tunjukkan KTM kamu untuk diskon 15%!',
    status: 'published'
  },
  {
    id: 'exp-18',
    branch_id: 'branch-senopati',
    date: '2026-09-13',
    pillar: 'Food',
    format: 'Single Post',
    title: 'Crispy Nori & Bamboo Shoots',
    caption_outline: 'Tekstur renyah pelengkap harmoni semangkuk ramen.',
    status: 'published'
  },
  {
    id: 'exp-19',
    branch_id: 'branch-ubud',
    date: '2026-09-12',
    pillar: 'Creative',
    format: 'Reels',
    title: 'The Art of Plating Japanese Ramen',
    caption_outline: 'Ketelitian dalam menyusun setiap elemen kelezatan.',
    status: 'published'
  },
  {
    id: 'exp-20',
    branch_id: 'branch-seminyak',
    date: '2026-09-11',
    pillar: 'Vibes',
    format: 'Feed Carousel',
    title: 'Weekend Night Beats & Cozy Corners',
    caption_outline: 'Playlist lo-fi jazz menemani malam santai di Seminyak.',
    status: 'published'
  }
];

export const INITIAL_INFLUENCERS: Influencer[] = [
  {
    id: 'inf-01',
    name: 'Gita Saraswati',
    handle: '@gitasaras_eats',
    location: 'Bali (Denpasar - Seminyak)',
    category: 'Foodie & Review',
    tier: 'Micro (10k-50k)',
    followers: '38.5K',
    engagement_rate: '4.8%',
    collaboration_type: 'barter',
    fee_estimate: 'Barter (2 Meals + Story 3x)',
    status: 'approved',
    contact: '+62 812-7788-9900 (WA Management)',
    notes: 'Sangat kooperatif, estetika foto warm clean cocok dengan feed Moggumung Bali.'
  },
  {
    id: 'inf-02',
    name: 'Alexander Lee',
    handle: '@alexwanderlust',
    location: 'Bali (Canggu & Ubud)',
    category: 'Lifestyle & Travel',
    tier: 'Mid-tier (50k-250k)',
    followers: '124K',
    engagement_rate: '3.9%',
    collaboration_type: 'paid',
    fee_estimate: 'Rp2.500.000 / 1 Reel + 2 Stories',
    status: 'approved',
    contact: 'collab@alexlee.me',
    notes: 'Expat audience sangat tinggi (65% Aus/Europe). Sangat ampuh untuk branch Seminyak & Canggu.'
  },
  {
    id: 'inf-03',
    name: 'Dinda Kirana',
    handle: '@kulinerbandungjuara',
    location: 'Bandung (Riau - Dago)',
    category: 'Foodie & Review',
    tier: 'Mid-tier (50k-250k)',
    followers: '185K',
    engagement_rate: '5.2%',
    collaboration_type: 'paid',
    fee_estimate: 'Rp1.750.000 / 1 Reel TikTok & IG',
    status: 'approved',
    contact: '+62 822-4455-6677 (DM/WA)',
    notes: 'Top food review di Bandung. Video Spicy Tori Paitan tempo hari menembus 80k views.'
  },
  {
    id: 'inf-04',
    name: 'Kadek Mahesa',
    handle: '@kadek_vibe',
    location: 'Bali (Ubud & Kintamani)',
    category: 'Lifestyle & Travel',
    tier: 'Nano (1k-10k)',
    followers: '8.4K',
    engagement_rate: '7.1%',
    collaboration_type: 'barter',
    fee_estimate: 'Barter (Ramen Dinner + 1 Reel)',
    status: 'approved',
    contact: 'Direct Instagram DM',
    notes: 'Engagement rate sangat tinggi, audiens lokal Bali loyal & visual sinematik.'
  },
  {
    id: 'inf-05',
    name: 'Valerie & Kevin',
    handle: '@dateideas.jkt',
    location: 'Jakarta (Senopati - Jaksel)',
    category: 'Lifestyle & Travel',
    tier: 'Mid-tier (50k-250k)',
    followers: '210K',
    engagement_rate: '4.4%',
    collaboration_type: 'paid',
    fee_estimate: 'Rp3.000.000 / Carousel + Reel',
    status: 'approved',
    contact: 'mgmt@dateideas.id',
    notes: 'Rekomendasi date night spot Jakarta Selatan. Sangat cocok mengangkat interior Moggumung Senopati.'
  },
  {
    id: 'inf-06',
    name: 'Rian Firdaus',
    handle: '@nongkrong.bdg',
    location: 'Bandung',
    category: 'Student & Gen-Z',
    tier: 'Micro (10k-50k)',
    followers: '42K',
    engagement_rate: '6.0%',
    collaboration_type: 'barter',
    fee_estimate: 'Barter (Voucher Rp300.000)',
    status: 'approved',
    contact: '+62 878-1122-3344',
    notes: 'Spesialis tempat nongkrong ramah kantong mahasiswa.'
  }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-01',
    branch_id: 'branch-ubud',
    branch_name: 'Moggumung Ubud',
    user_name: 'Super Admin Bali',
    action_type: 'request_status_changed',
    title: 'Desain Disetujui: Banner Promo Ubud Foodie Pass',
    description: 'Permintaan desain telah disetujui dan tautan aset resolusi tinggi (Canva/Drive) siap diunduh.',
    timestamp: '2026-09-21 15:40 WITA',
    read_by: [],
    severity: 'success',
    target_id: 'req-01',
    link_tab: 'requests'
  },
  {
    id: 'act-02',
    branch_id: 'branch-ubud',
    branch_name: 'Moggumung Ubud',
    user_name: 'Budi Santoso (Ubud)',
    action_type: 'proof_uploaded',
    title: 'Bukti Transfer Diunggah: INV/MGG/2026/09/001',
    description: 'Cabang Ubud mengunggah bukti bayar m-Banking BCA sebesar Rp7.950.000 untuk verifikasi.',
    timestamp: '2026-09-21 14:15 WITA',
    read_by: [],
    severity: 'purple',
    target_id: 'inv-2026-09-ubud',
    link_tab: 'billing'
  },
  {
    id: 'act-03',
    branch_id: 'branch-seminyak',
    branch_name: 'Moggumung Seminyak',
    user_name: 'Super Admin Bali',
    action_type: 'payment_verified',
    title: 'Pembayaran Lunas: INV/MGG/2026/09/002',
    description: 'Tagihan retainer dan budget iklan Seminyak Rp8.000.000 telah diverifikasi dan lunas.',
    timestamp: '2026-09-20 11:20 WITA',
    read_by: ['user-seminyak'],
    severity: 'success',
    target_id: 'inv-2026-09-seminyak',
    link_tab: 'billing'
  },
  {
    id: 'act-04',
    branch_id: 'branch-bandung',
    branch_name: 'Moggumung Bandung',
    user_name: 'Super Admin Bali',
    action_type: 'custom_pricing_updated',
    title: 'Penyesuaian Harga Langganan Khusus',
    description: 'Pusat menyetel harga paket langganan Starter Rp4.500.000/bulan untuk cabang Moggumung Bandung.',
    timestamp: '2026-09-19 16:00 WITA',
    read_by: [],
    severity: 'warning',
    target_id: 'branch-bandung',
    link_tab: 'billing'
  },
  {
    id: 'act-05',
    branch_id: 'branch-canggu',
    branch_name: 'Moggumung Canggu',
    user_name: 'Super Admin Bali',
    action_type: 'invoice_generated',
    title: 'Tagihan Baru Diterbitkan: INV/MGG/2026/09/004',
    description: 'Invoice retainer bulanan periode September telah diterbitkan untuk cabang Moggumung Canggu.',
    timestamp: '2026-09-18 09:00 WITA',
    read_by: [],
    severity: 'info',
    target_id: 'inv-2026-09-canggu',
    link_tab: 'billing'
  },
  {
    id: 'act-06',
    branch_id: 'branch-senopati',
    branch_name: 'Moggumung Senopati',
    user_name: 'Dewi Lestari (Senopati)',
    action_type: 'request_submitted',
    title: 'Pengajuan Desain Baru: Opening Jakarta Influencer Teaser',
    description: 'Pengajuan desain baru kategori Vibes untuk persiapan grand opening Jakarta.',
    timestamp: '2026-09-17 13:10 WITA',
    read_by: ['user-pusat'],
    severity: 'info',
    target_id: 'req-05',
    link_tab: 'requests'
  }
];

export const INITIAL_BUDGET_REQUESTS: BudgetRequest[] = [
  {
    id: 'bgt-01',
    requester_id: 'user-creative-1',
    requester_name: 'Ji-won Park',
    requester_role: 'hq_creative',
    target_branch_id: 'branch-seminyak',
    target_branch_name: 'Moggumung Seminyak',
    type: 'meta_ads',
    title: 'Meta Ads Campaign: Autumn Truffle Ramen Launch',
    amount: 1500000,
    objective: 'Boost reach and local foodies engagement in Badung/Seminyak for 14 days.',
    status: 'pending_approval',
    created_at: '2026-09-21'
  },
  {
    id: 'bgt-02',
    requester_id: 'user-creative-2',
    requester_name: 'Dewa Aditya',
    requester_role: 'hq_creative',
    target_branch_id: 'branch-canggu',
    target_branch_name: 'Moggumung Canggu',
    type: 'photoshoot_visit',
    title: 'Lighting & Sizzle Props Rental for Canggu Sunset Reels',
    amount: 850000,
    objective: 'Extra lighting equipment rental and props for sunset sizzle video reels.',
    status: 'disbursed',
    approved_by: 'Joon-ho Lee (HQ Leader)',
    disbursed_by: 'Joon-ho Lee (HQ Leader)',
    disbursed_at: '2026-09-20 14:30 WITA',
    transfer_proof_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    transfer_reference: 'BCA-MB-99238102',
    transfer_note: 'Dana sewa lighting 2 hari sudah ditransfer ke rek BCA Dewa Aditya.',
    created_at: '2026-09-20'
  },
  {
    id: 'bgt-03',
    requester_id: 'user-creative-1',
    requester_name: 'Ji-won Park',
    requester_role: 'hq_creative',
    target_branch_id: 'branch-ubud',
    target_branch_name: 'Moggumung Ubud',
    type: 'meta_ads',
    title: 'Instagram Boost Reels: Ubud Signature Truffle Broth',
    amount: 1200000,
    objective: 'Meta Ads boosting video reels promo opening Ubud.',
    status: 'completed',
    approved_by: 'Min-jun Kim (HQ Owner)',
    disbursed_by: 'Min-jun Kim (HQ Owner)',
    disbursed_at: '2026-09-15 11:00 WITA',
    transfer_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    transfer_reference: 'BCA-TF-88349102',
    transfer_note: 'Dana deposit saldo Meta Ads ditransfer ke credit balance card Ji-won.',
    acknowledged_at: '2026-09-15 11:20 WITA',
    completion_report: {
      executed_date: '2026-09-18',
      spent_amount: 1200000,
      proof_screenshot_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      report_notes: 'Iklan Meta Ads berjalan 7 hari di radius 15km Gianyar/Ubud. Total reach 48.200 akun kuliner.',
      impressions: 62400,
      reach: 48200,
      deliverable_link: 'https://instagram.com/p/moggumung_ubud_reel'
    },
    created_at: '2026-09-14'
  }
];

export const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'wtx-01',
    branch_id: 'branch-ubud',
    branch_name: 'Moggumung Ubud',
    type: 'top_up',
    amount: 10000000,
    title: 'Deposit Saldo Awal Iklan & Produksi',
    description: 'Top-up saldo wallet via transfer Bank BCA.',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    status: 'verified',
    created_at: '2026-09-01',
    verified_by: 'Min-jun Kim (HQ Owner)'
  },
  {
    id: 'wtx-02',
    branch_id: 'branch-ubud',
    branch_name: 'Moggumung Ubud',
    type: 'budget_deduct',
    amount: 1200000,
    title: 'Pemotongan Saldo: Meta Ads Ubud Signature Truffle Broth',
    description: 'Biaya iklan Meta Ads kampanye video reels.',
    reference_id: 'bgt-03',
    status: 'verified',
    created_at: '2026-09-15',
    verified_by: 'Min-jun Kim (HQ Owner)'
  },
  {
    id: 'wtx-03',
    branch_id: 'branch-seminyak',
    branch_name: 'Moggumung Seminyak',
    type: 'top_up',
    amount: 15000000,
    title: 'Top-Up Saldo Iklan Q3 (Seminyak)',
    description: 'Deposit untuk kampanye ads foodies dan influencer review.',
    proof_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
    status: 'verified',
    created_at: '2026-09-05',
    verified_by: 'Joon-ho Lee (HQ Leader)'
  },
  {
    id: 'wtx-04',
    branch_id: 'branch-canggu',
    branch_name: 'Moggumung Canggu',
    type: 'top_up',
    amount: 5000000,
    title: 'Top-Up Saldo Wallet Cabang Canggu',
    description: 'Deposit produksi konten dan boost Instagram.',
    status: 'verified',
    created_at: '2026-09-10',
    verified_by: 'Joon-ho Lee (HQ Leader)'
  },
  {
    id: 'wtx-05',
    branch_id: 'branch-canggu',
    branch_name: 'Moggumung Canggu',
    type: 'budget_deduct',
    amount: 850000,
    title: 'Pemotongan Saldo: Lighting & Sizzle Props Rental',
    description: 'Biaya sewa alat produksi video reels sunset Canggu.',
    reference_id: 'bgt-02',
    status: 'verified',
    created_at: '2026-09-20',
    verified_by: 'Joon-ho Lee (HQ Leader)'
  }
];

export const INITIAL_SHOOT_REQUESTS: ShootRequest[] = [
  {
    id: 'sht-01',
    branch_id: 'branch-seminyak',
    branch_name: 'Moggumung Seminyak',
    requester_id: 'user-mgr-seminyak',
    requester_name: 'Kevin Pratama (Manager Seminyak)',
    requester_role: 'branch_manager',
    type: 'photoshoot_visit',
    title: 'New Cocktail & Sunset Terrace Photoshoot',
    preferred_date: '2026-09-28',
    details: 'Need 1 creative crew to shoot high-res photos and b-roll videos for our new sunset terrace seating and craft cocktails.',
    status: 'scheduled',
    assigned_creative_id: 'user-creative-2',
    assigned_creative_name: 'Dewa Aditya',
    created_at: '2026-09-21'
  },
  {
    id: 'sht-02',
    branch_id: 'branch-ubud',
    branch_name: 'Moggumung Ubud',
    requester_id: 'user-ubud',
    requester_name: 'Budi Santoso (Owner Ubud)',
    requester_role: 'branch_owner',
    type: 'menu_revamp_shoot',
    title: 'Chef Special Ramen Bowl Photoshoot',
    preferred_date: '2026-10-03',
    details: 'Capture 5 new chef special bowls with raw wooden table aesthetics khas Ubud.',
    status: 'pending',
    created_at: '2026-09-20'
  }
];

export const INITIAL_VOUCHER_CAMPAIGNS: InfluencerVoucherCampaign[] = [
  {
    id: 'vch-01',
    influencer_id: 'inf-01',
    influencer_name: 'Made Amanda',
    influencer_handle: '@madediningbali',
    branch_id: 'branch-seminyak',
    branch_name: 'Moggumung Seminyak',
    code: 'MANDABALI15',
    discount_percent: 15,
    valid_until: '2026-10-15',
    redemption_count: 84,
    total_sales_driven: 18450000,
    cost_spent: 1200000,
    status: 'active'
  },
  {
    id: 'vch-02',
    influencer_id: 'inf-02',
    influencer_name: 'Gede Pramana',
    influencer_handle: '@balifoodhunter',
    branch_id: 'branch-canggu',
    branch_name: 'Moggumung Canggu',
    code: 'HUNTERCANGGU',
    discount_percent: 10,
    valid_until: '2026-10-10',
    redemption_count: 142,
    total_sales_driven: 29800000,
    cost_spent: 800000,
    status: 'active'
  },
  {
    id: 'vch-03',
    influencer_id: 'inf-03',
    influencer_name: 'Ketut Ratna',
    influencer_handle: '@ubudveganandeats',
    branch_id: 'branch-ubud',
    branch_name: 'Moggumung Ubud',
    code: 'UBUDEATS20',
    discount_percent: 20,
    valid_until: '2026-09-30',
    redemption_count: 56,
    total_sales_driven: 11200000,
    cost_spent: 600000,
    status: 'active'
  },
  {
    id: 'vch-04',
    influencer_id: 'inf-04',
    influencer_name: 'Jessica Tan',
    influencer_handle: '@jessicajktfoodie',
    branch_id: 'branch-senopati',
    branch_name: 'Moggumung Senopati',
    code: 'JESSICASENOPATI',
    discount_percent: 15,
    valid_until: '2026-10-20',
    redemption_count: 118,
    total_sales_driven: 34500000,
    cost_spent: 2500000,
    status: 'active'
  }
];

export const INITIAL_HQ_REIMBURSEMENTS: import('../types.ts').HqReimbursementRequest[] = [
  {
    id: 'reimb-01',
    requester_id: 'usr-creative-01',
    requester_name: 'Ji-won Park',
    requester_role: 'hq_creative',
    category: 'props_equipment',
    title: 'Autumn Food Photography Props & Rustic Bowls',
    amount: 850000,
    description: 'Purchased authentic Japanese ceramic ramen bowls and wooden spoons for Seminyak seasonal shoot.',
    receipt_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    status: 'approved',
    approved_by: 'Min-jun Kim (HQ Owner & Founder)',
    approved_at: '2026-09-22',
    admin_notes: 'Approved. Essential props for Q4 menu launch.',
    created_at: '2026-09-21'
  },
  {
    id: 'reimb-02',
    requester_id: 'usr-creative-02',
    requester_name: 'Hye-jin Lee',
    requester_role: 'hq_creative',
    category: 'travel_transport',
    title: 'Grab Transport & Parking (Ubud Branch Shoot Visit)',
    amount: 320000,
    description: 'On-site video equipment hauling and roundtrip transport for sunset cocktail shoot.',
    receipt_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    status: 'approved',
    approved_by: 'Min-jun Kim (HQ Owner & Founder)',
    approved_at: '2026-09-23',
    admin_notes: 'Approved transport claim.',
    created_at: '2026-09-22'
  },
  {
    id: 'reimb-03',
    requester_id: 'usr-creative-01',
    requester_name: 'Ji-won Park',
    requester_role: 'hq_creative',
    category: 'software_license',
    title: 'Midjourney & Motion Graphics Plugin Annual Seat',
    amount: 1200000,
    description: 'Generative asset synthesis tool license for commercial promo campaign backdrops.',
    receipt_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    status: 'pending_approval',
    created_at: '2026-09-26'
  }
];

export const INITIAL_HQ_TODOS: import('../types.ts').HqTodoItem[] = [
  {
    id: 'todo-01',
    user_id: 'usr-creative-01',
    user_name: 'Ji-won Park',
    title: 'Finish Ramyeon 50K Weekday Only motion reel edit (Ubud)',
    category: 'design',
    related_request_id: 'req-1790407951362',
    target_date: '2026-09-26',
    completed: true,
    completed_at: '2026-09-26 14:30',
    included_in_work_log: true,
    created_at: '2026-09-26'
  },
  {
    id: 'todo-02',
    user_id: 'usr-creative-01',
    user_name: 'Ji-won Park',
    title: 'Export Story 9:16 and Feed 1:1 slices for Autumn Truffle Launch',
    category: 'design',
    related_request_id: 'req-01',
    target_date: '2026-09-28',
    completed: true,
    completed_at: '2026-09-26 16:15',
    included_in_work_log: true,
    created_at: '2026-09-26'
  },
  {
    id: 'todo-03',
    user_id: 'usr-creative-01',
    user_name: 'Ji-won Park',
    title: 'Color grade 4K raw clips from Seminyak Sunset Terrace photoshoot',
    category: 'shoot',
    target_date: '2026-09-27',
    completed: false,
    included_in_work_log: false,
    created_at: '2026-09-26'
  },
  {
    id: 'todo-04',
    user_id: 'usr-creative-02',
    user_name: 'Hye-jin Lee',
    title: 'Draft tabletop acrylic standee QR design for Bandung branch',
    category: 'design',
    target_date: '2026-09-30',
    completed: false,
    included_in_work_log: false,
    created_at: '2026-09-26'
  }
];

export const INITIAL_TEAM_CHAT_MESSAGES: import('../types.ts').TeamChatMessage[] = [
  {
    id: 'chat-01',
    sender_id: 'usr-owner-01',
    sender_name: 'Min-jun Kim',
    sender_role: 'hq_owner',
    channel: 'hq_internal',
    message: 'Hello creative team! Please prioritize the Autumn Truffle assets so Bali branches can begin Instagram boosting this Friday.',
    tagged_user_ids: ['usr-creative-01', 'usr-creative-02'],
    tagged_user_names: ['Ji-won Park', 'Hye-jin Lee'],
    linked_request_id: 'req-01',
    linked_request_title: 'Poster Menu Spesial Autumn Truffle Ramen',
    created_at: '2026-09-26 10:15'
  },
  {
    id: 'chat-02',
    sender_id: 'usr-creative-01',
    sender_name: 'Ji-won Park',
    sender_role: 'hq_creative',
    channel: 'hq_internal',
    message: '@Min-jun Kim 4K raw export is completed and uploaded to Google Drive. Check the smartphone live mockup!',
    tagged_user_ids: ['usr-owner-01'],
    tagged_user_names: ['Min-jun Kim'],
    linked_request_id: 'req-01',
    linked_request_title: 'Poster Menu Spesial Autumn Truffle Ramen',
    created_at: '2026-09-26 11:30'
  },
  {
    id: 'chat-03',
    sender_id: 'usr-branch-ubud-owner',
    sender_name: 'Budi Santoso',
    sender_role: 'branch_owner',
    channel: 'branch_collab',
    branch_id: 'branch-ubud',
    branch_name: 'Moggumung Ubud',
    message: 'Hi HQ Creative! We submitted a request for Ramyeon 50K Weekday poster. Looking forward to the draft.',
    tagged_user_ids: ['usr-creative-01'],
    tagged_user_names: ['Ji-won Park'],
    linked_request_id: 'req-1790407951362',
    linked_request_title: 'Ramyeon 50K Weekday only',
    created_at: '2026-09-26 13:00'
  }
];

export const INITIAL_MEETING_AGENDAS: import('../types.ts').MeetingAgenda[] = [
  {
    id: 'meet-01',
    title: 'Weekly HQ Creative Production & Pipeline Sync',
    date: '2026-09-26',
    start_time: '09:00',
    end_time: '10:00',
    type: 'hq_sync',
    attendees: ['Min-jun Kim (Owner)', 'Do-hyun Kang (Leader)', 'Ji-won Park (Creative)', 'Hye-jin Lee (Creative)'],
    location_or_link: 'HQ Studio Room A / Google Meet: meet.google.com/mgg-hq-sync',
    notes: 'Review pending requests queue, approve budget claims, allocate Seminyak photoshoot slots.',
    created_at: '2026-09-25'
  },
  {
    id: 'meet-02',
    title: 'Monthly Promo Strategy & Cut-off Readiness (Ubud & Seminyak)',
    date: '2026-09-28',
    start_time: '14:00',
    end_time: '15:30',
    type: 'branch_brief',
    attendees: ['Do-hyun Kang (Leader)', 'Budi Santoso (Owner Ubud)', 'Wayan Sudirta (Owner Seminyak)'],
    location_or_link: 'Google Meet: meet.google.com/mgg-branch-strategy',
    notes: 'Discuss Q4 influencer voucher codes and Meta Ads budget allocation.',
    created_at: '2026-09-25'
  },
  {
    id: 'meet-03',
    title: 'Sunset Terrace 4K Video Creative Ideation & Storyboard',
    date: '2026-09-30',
    start_time: '11:00',
    end_time: '12:00',
    type: 'creative_ideation',
    attendees: ['Ji-won Park', 'Hye-jin Lee', 'Ketut Suardana'],
    location_or_link: 'Moggumung Seminyak On-site / Studio',
    notes: 'Prepare props, lighting angle at golden hour (17:30 WITA).',
    created_at: '2026-09-26'
  }
];

export const INITIAL_PLATFORM_PLANS: BrandSubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter Tier',
    monthly_price: 2490000,
    annual_price: 24900000,
    max_branches: 3,
    max_design_requests_per_branch: 8,
    max_promos_per_branch: 3,
    includes_influencer_crm: false,
    includes_collaboration_chat: true,
    includes_auto_invoicing: true,
    includes_dedicated_support: false,
    description: 'Cocok untuk brand berkembang 1-3 cabang yang baru memulai standarisasi promosi & operasional visual.'
  },
  {
    id: 'growth',
    name: 'Growth Multi-Branch',
    monthly_price: 4890000,
    annual_price: 48900000,
    max_branches: 10,
    max_design_requests_per_branch: 18,
    max_promos_per_branch: 6,
    includes_influencer_crm: true,
    includes_collaboration_chat: true,
    includes_auto_invoicing: true,
    includes_dedicated_support: true,
    is_popular: true,
    description: 'Pilihan paling ideal untuk brand franchise 4-10 cabang dengan CRM influencer terpadu dan auto-invoicing.'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    monthly_price: 8990000,
    annual_price: 89900000,
    max_branches: 50,
    max_design_requests_per_branch: 999,
    max_promos_per_branch: 20,
    includes_influencer_crm: true,
    includes_collaboration_chat: true,
    includes_auto_invoicing: true,
    includes_dedicated_support: true,
    description: 'Solusi tanpa batas untuk jaringan ritel/F&B nasional, custom SLA, prioritas render studio & dedicated account manager.'
  }
];

export const INITIAL_PLATFORM_BRANDS: PlatformBrandTenant[] = [
  {
    id: 'brand-moggumung',
    slug: 'moggumung',
    name: 'Moggumung',
    tagline: 'Authentic Korean Comfort Food & Ramyeon Bar',
    logo_url: '',
    primary_color: '#FF5B14',
    hq_owner_name: 'Min-jun Kim',
    hq_owner_email: 'moggumung.bali2024@gmail.com',
    hq_owner_phone: '0812-9999-0001',
    subscription_plan_id: 'growth',
    subscription_status: 'active',
    subscription_start_date: '2026-01-01',
    subscription_end_date: '2026-12-31',
    monthly_fee: 4890000,
    branches_count: 5,
    is_verified: true,
    created_at: '2025-11-01',
    last_active_at: '2026-09-26 18:30',
    wallet_balance: 34500000,
    notes: 'Brand utama pilot project franchise Bali & Bandung.'
  }
];

export const INITIAL_PLATFORM_WITHDRAWALS: PlatformWalletWithdrawal[] = [];

export const INITIAL_REMINDER_LOGS: SubscriptionReminderLog[] = [];

// ==========================================
// BRAND DATA REGISTRY (DATA ISOLATION ENGINE)
// ==========================================

export interface BrandDataset {
  whitelabel: WhitelabelConfig;
  branches: Branch[];
  users: UserProfile[];
  designRequests: DesignRequest[];
  promos: PromoRequest[];
  invoices: Invoice[];
  influencers: Influencer[];
  quotas?: MonthlyQuota[];
  activities?: ActivityItem[];
  attendances?: AttendanceRecord[];
  budgetRequests?: BudgetRequest[];
  shootRequests?: ShootRequest[];
  walletTransactions?: WalletTransaction[];
  hqReimbursements?: HqReimbursementRequest[];
  hqTodos?: HqTodoItem[];
  teamChatMessages?: TeamChatMessage[];
  meetingAgendas?: MeetingAgenda[];
  voucherCampaigns?: InfluencerVoucherCampaign[];
  exposureSlots?: ExposureSlot[];
}

export const BRAND_DATA_REGISTRY: Record<string, BrandDataset> = {
  moggumung: {
    whitelabel: DEFAULT_WHITELABEL_CONFIG,
    branches: INITIAL_BRANCHES,
    users: INITIAL_USERS.filter((u) => !u.id.startsWith('user-platform')),
    designRequests: INITIAL_DESIGN_REQUESTS,
    promos: INITIAL_PROMOS,
    invoices: INITIAL_INVOICES,
    influencers: INITIAL_INFLUENCERS
  },

};

export function getInitialBrandDataset(slug: string): BrandDataset {
  const normalized = (slug || 'moggumung').toLowerCase().trim();
  if (BRAND_DATA_REGISTRY[normalized]) {
    return BRAND_DATA_REGISTRY[normalized];
  }
  const brandTenant = INITIAL_PLATFORM_BRANDS.find((b) => b.slug.toLowerCase() === normalized);
  const brandName = brandTenant?.name || slug;
  return {
    whitelabel: {
      ...DEFAULT_WHITELABEL_CONFIG,
      brand_name: brandName,
      brand_subtitle: brandTenant?.tagline || 'Social Media & Quota Portal',
      brand_monogram: brandName.substring(0, 2).toUpperCase(),
      company_legal_name: `PT ${brandName} Multi Nusantara`,
      custom_primary_hex: brandTenant?.primary_color || '#FF5B14'
    },
    branches: [
      {
        id: `branch-${normalized}-main`,
        name: `${brandName} Central`,
        code: `${brandName.substring(0, 3).toUpperCase()}-01`,
        location: 'Jakarta',
        city: 'Jakarta Selatan',
        contract_status: 'active',
        contact_person: brandTenant?.hq_owner_name || 'Owner',
        phone: brandTenant?.hq_owner_phone || '0812-9999-0001',
        custom_retainer_fee: 6000000,
        package_tier: 'Standard',
        wallet_balance: 5000000,
        max_monthly_design_requests: 12,
        max_monthly_active_promos: 4,
        lead_days: 5,
        pic_name: 'Store Operations Manager',
        pic_phone: '0812-3456-7890',
        pic_email: `manager@${normalized}.com`,
        owner_name: brandTenant?.hq_owner_name || 'Owner',
        owner_phone: brandTenant?.hq_owner_phone || '0812-9999-0001',
        owner_email: brandTenant?.hq_owner_email || `owner@${normalized}.com`,
        created_at: '2026-01-01'
      }
    ],
    users: [
      {
        id: `user-${normalized}-owner`,
        branch_id: null,
        role: 'hq_owner',
        full_name: `${brandTenant?.hq_owner_name || 'Owner'} (HQ Owner)`,
        email: brandTenant?.hq_owner_email || `owner@${normalized}.com`,
        phone: brandTenant?.hq_owner_phone || '0812-9999-0001',
        job_title: `Brand Owner & Founder (${brandName})`,
        status: 'active',
        password: 'Media',
        joined_date: '2026-01-01'
      }
    ],
    designRequests: [],
    promos: [],
    invoices: [],
    influencers: []
  };
}

-- Sample Data for Testing

-- 1. Kullanıcılar Ekle
INSERT INTO users (name, email, role, department) VALUES
('Ahmet Yönetici', 'ahmet@company.com', 'admin', 'Yönetim'),
('Fatma Müdür', 'fatma@company.com', 'manager', 'Satış'),
('Mehmet Çalışan', 'mehmet@company.com', 'employee', 'Satış'),
('Ayşe Çalışan', 'ayse@company.com', 'employee', 'Pazarlama');

-- 2. Şirket Seviyesi OKR (Level 1)
INSERT INTO okrs (title, objective, key_result, kr_type, current_value, target_value, unit, status, level, created_by) VALUES
(
  'Q1 2024 - Gelir Hedefi',
  'Şirketi hızlı büyüt',
  'Aylık geliri 500K''dan 1M TL''ye çıkar',
  'currency',
  '500000',
  '1000000',
  'TL',
  'active',
  1,
  1  -- Ahmet oluşturdu
);

-- 3. Departman Seviyesi OKR (Level 2 - Şirket OKR'sine bağlı)
INSERT INTO okrs (title, objective, key_result, kr_type, current_value, target_value, unit, status, level, parent_id, created_by) VALUES
(
  'Satış Departmanı - Q1 2024',
  'Yeni müşteri sayısını 2x yap',
  'Müşteri sayısını 50''den 100''e çıkar',
  'number',
  '50',
  '100',
  'kişi',
  'active',
  2,
  1,  -- parent_id = 1 (Şirket OKR'sine bağlı)
  2   -- Fatma oluşturdu
),
(
  'Pazarlama Departmanı - Q1 2024',
  'Marka bilinirliğini artır',
  'Web sitesi trafiğini 100K''dan 500K''ya çıkar',
  'number',
  '100000',
  '500000',
  'ziyaret',
  'active',
  2,
  1,
  2
);

-- 4. Takım Seviyesi OKR (Level 3 - Departman OKR'sine bağlı)
INSERT INTO okrs (title, objective, key_result, kr_type, current_value, target_value, unit, status, level, parent_id, created_by) VALUES
(
  'Satış Takımı - Hedef Müşteriler',
  'Enterprise müşteri kazanımı yap',
  'Enterprise müşteri sayısını 5''ten 15''e çıkar',
  'number',
  '5',
  '15',
  'müşteri',
  'active',
  3,
  2,  -- parent_id = 2 (Satış Departmanı OKR'sine bağlı)
  2
);

-- 5. Bireysel Seviye OKR (Level 4)
INSERT INTO okrs (title, objective, key_result, kr_type, current_value, target_value, unit, status, level, parent_id, created_by) VALUES
(
  'Mehmet - Müşteri Kazanım',
  'Bölge hedefini tamamla',
  'Yeni müşteri sayısını 10''a çıkar',
  'number',
  '3',
  '10',
  'müşteri',
  'active',
  4,
  3,  -- parent_id = 3 (Satış Takımı OKR'sine bağlı)
  2
);

-- 6. Aksiyonlar (OKR 2 - Satış Departmanı)
INSERT INTO actions (title, description, okr_id, priority, status, due_date) VALUES
(
  'Müşteri anketi gönder',
  'Mevcut müşterilere memnuniyet anketi gönder',
  2,
  'high',
  'in_progress',
  '2024-02-15'
),
(
  'Yeni ürün sunumu hazırla',
  'Enterprise müşterilerine yönelik ürün sunumu',
  2,
  'high',
  'todo',
  '2024-02-20'
),
(
  'Sales pitch iyileştir',
  'Satış sunumunu güçlendir',
  2,
  'medium',
  'todo',
  '2024-02-25'
);

-- 7. Aksiyonları Kişilere Ata
INSERT INTO assignments (action_id, assigned_to, assigned_by, progress, status) VALUES
(1, 3, 2, 50, 'in_progress'),   -- Aksiyon 1 → Mehmet'e atandı, %50 yapıldı
(1, 4, 2, 30, 'in_progress'),   -- Aksiyon 1 → Ayşe'ye de atandı, %30 yapıldı
(2, 3, 2, 0, 'pending'),        -- Aksiyon 2 → Mehmet'e atandı, henüz başlamadı
(3, 4, 2, 70, 'in_progress');   -- Aksiyon 3 → Ayşe'ye atandı, %70 yapıldı

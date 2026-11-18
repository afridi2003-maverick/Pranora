#!/usr/bin/env python3
"""
Pranora Phase 1 (MVP) Individual Progress Report Generator
Generates a multi-page, publication-quality PDF report without third-party dependencies.
"""

import sys

class PDFCanvas:
    def __init__(self):
        self.stream = []
        
    def save_state(self):
        self.stream.append("q")
        
    def restore_state(self):
        self.stream.append("Q")
        
    def set_fill_color(self, r, g, b):
        self.stream.append(f"{r:.3f} {g:.3f} {b:.3f} rg")
        
    def set_stroke_color(self, r, g, b):
        self.stream.append(f"{r:.3f} {g:.3f} {b:.3f} RG")
        
    def set_line_width(self, w):
        self.stream.append(f"{w:.2f} w")
        
    def rect(self, x, y, w, h, fill=True, stroke=False):
        op = "B" if fill and stroke else "f" if fill else "S"
        self.stream.append(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re {op}")
        
    def rounded_rect(self, x, y, w, h, r=4, fill=True, stroke=False):
        # Approximation with path
        self.rect(x, y, w, h, fill, stroke)
        
    def line(self, x1, y1, x2, y2):
        self.stream.append(f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")
        
    def escape_text(self, text):
        return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        
    def text(self, x, y, text, font="F1", size=10, r=0.1, g=0.1, b=0.1):
        self.save_state()
        self.set_fill_color(r, g, b)
        escaped = self.escape_text(str(text))
        self.stream.append(f"BT /{font} {size:.1f} Tf {x:.2f} {y:.2f} Td ({escaped}) Tj ET")
        self.restore_state()
        
    def get_stream(self):
        return "\n".join(self.stream)


class PDFDocument:
    def __init__(self):
        self.pages = []
        
    def new_page(self):
        canvas = PDFCanvas()
        self.pages.append(canvas)
        return canvas
        
    def save(self, filepath):
        out = bytearray()
        out.extend(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        objects = []
        
        def add_obj(body):
            objects.append(body)
            return len(objects)
            
        f1 = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        f2 = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        f3 = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")
        f4 = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>")
        
        pages_idx = len(objects) + 1
        page_objs = []
        
        for p in self.pages:
            s_bytes = p.get_stream().encode("latin1", "replace")
            s_obj = add_obj(f"<< /Length {len(s_bytes)} >>\nstream\n" + s_bytes.decode("latin1") + "\nendstream")
            p_obj = add_obj(f"""<<
  /Type /Page
  /Parent {pages_idx} 0 R
  /MediaBox [0 0 595.28 841.89]
  /Resources <<
    /Font <<
      /F1 {f1} 0 R
      /F2 {f2} 0 R
      /F3 {f3} 0 R
      /F4 {f4} 0 R
    >>
  >>
  /Contents {s_obj} 0 R
>>""")
            page_objs.append(p_obj)
            
        kids_str = " ".join(f"{idx} 0 R" for idx in page_objs)
        pages_obj = add_obj(f"<< /Type /Pages /Kids [{kids_str}] /Count {len(page_objs)} >>")
        catalog_obj = add_obj(f"<< /Type /Catalog /Pages {pages_obj} 0 R >>")
        
        offsets = []
        for i, obj in enumerate(objects):
            offsets.append(len(out))
            out.extend(f"{i+1} 0 obj\n{obj}\nendobj\n".encode("latin1"))
            
        xref_start = len(out)
        out.extend(f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n".encode("latin1"))
        for off in offsets:
            out.extend(f"{off:010d} 00000 n \n".encode("latin1"))
            
        out.extend(f"""trailer
<<
  /Size {len(objects)+1}
  /Root {catalog_obj} 0 R
>>
startxref
{xref_start}
%%EOF\n""".encode("latin1"))
        
        with open(filepath, "wb") as f:
            f.write(out)
        print(f"Successfully generated PDF: {filepath} ({len(out)} bytes)")


def draw_header_banner(c, page_num, total_pages=3):
    # Top Emerald Banner
    c.set_fill_color(0.086, 0.502, 0.239) # #16803d
    c.rect(36, 760, 523, 56, fill=True)
    
    # Title
    c.text(50, 792, "Pranora (Pet Care BD) — Phase 1 (MVP) Progress Report", font="F2", size=13.5, r=1, g=1, b=1)
    c.text(50, 774, "Official Monorepo Audit & Individual Contribution Breakdown | 19 Nov 2026", font="F1", size=8.5, r=0.9, g=0.95, b=0.9)
    
    # Page indicator inside banner
    c.set_fill_color(0.12, 0.40, 0.20)
    c.rect(480, 770, 65, 34, fill=True)
    c.text(492, 788, f"PAGE {page_num}/{total_pages}", font="F2", size=8, r=1, g=1, b=1)
    c.text(490, 776, "Phase 1: 53.1%", font="F1", size=7, r=0.85, g=1, b=0.85)


def draw_footer(c, page_num, total_pages=3):
    c.set_stroke_color(0.85, 0.85, 0.85)
    c.set_line_width(0.7)
    c.line(36, 42, 559, 42)
    c.text(36, 30, "Pranora — Bangla-First Pet Care Monorepo (Next.js 14, Expo NativeWind, Supabase PostGIS)", font="F1", size=7.5, r=0.5, g=0.5, b=0.5)
    c.text(510, 30, f"Page {page_num} of {total_pages}", font="F2", size=7.5, r=0.4, g=0.4, b=0.4)


def build_full_report(pdf_path):
    doc = PDFDocument()
    
    # =========================================================================
    # PAGE 1: Executive Overview + Leaderboard + Afridi Deep Dive
    # =========================================================================
    p1 = doc.new_page()
    draw_header_banner(p1, 1, 3)
    
    # Summary KPI Cards (4 cards)
    cards = [
        ("TOTAL TASKS DONE", "36 / 64", "56.3% Completed", 0.09, 0.64, 0.29),
        ("EFFORT POINTS", "75 / 132", "56.8% Points Done", 0.14, 0.38, 0.92),
        ("PHASE 0 (SETUP)", "13 / 13", "100% Completed", 0.09, 0.64, 0.29),
        ("TOP PERFORMERS", "Zihad & Afridi", "84.6% Done (11 tasks each)", 0.85, 0.45, 0.05),
    ]
    card_w = 124
    for i, (label, val, sub, cr, cg, cb) in enumerate(cards):
        cx = 36 + i * (card_w + 9)
        p1.set_fill_color(0.97, 0.98, 0.99)
        p1.set_stroke_color(0.85, 0.88, 0.92)
        p1.set_line_width(0.8)
        p1.rect(cx, 696, card_w, 50, fill=True, stroke=True)
        
        p1.text(cx + 8, 732, label, font="F2", size=7, r=0.4, g=0.45, b=0.5)
        p1.text(cx + 8, 715, val, font="F2", size=13, r=0.08, g=0.1, b=0.15)
        p1.text(cx + 8, 702, sub, font="F1", size=7.5, r=cr, g=cg, b=cb)
        
    # Section Title: Leaderboard
    p1.set_fill_color(0.92, 0.94, 0.96)
    p1.rect(36, 672, 523, 16, fill=True)
    p1.text(42, 676, "1. INDIVIDUAL PERFORMANCE LEADERBOARD (PHASE 1 — MVP)", font="F2", size=8.5, r=0.1, g=0.2, b=0.3)
    
    # Leaderboard Table Header
    p1.set_fill_color(0.88, 0.91, 0.94)
    p1.rect(36, 654, 523, 15, fill=True)
    headers = [("MEMBER", 42), ("ROLE", 160), ("BRANCH", 260), ("TASKS DONE", 330), ("TASK %", 410), ("POINTS", 465), ("PTS %", 520)]
    for h, hx in headers:
        p1.text(hx, 658, h, font="F2", size=7.5, r=0.2, g=0.25, b=0.3)
        
    members_data = [
        ("M. Z. H. Zihad", "Product & Health Lead", "zihad", "11 / 13", "84.6%", "25 / 28", "89.3%", True),
        ("M. H. Afridi", "Platform Lead", "afridi", "11 / 13", "84.6%", "22 / 27", "81.5%", False),
        ("Brehat Dey", "Rescue & Adoption Lead", "brihoth", "8 / 13", "61.5%", "15 / 25", "60.0%", True),
        ("Zimia Samia", "Vet Discovery Lead", "zimia", "5 / 13", "38.5%", "11 / 26", "42.3%", False),
        ("Tain Tabassum", "Vet Booking Lead", "tain", "1 / 12", "8.3%", "2 / 26", "7.7%", True),
    ]
    
    y = 638
    for name, role, branch, td, tp, pd, pp, alt in members_data:
        if alt:
            p1.set_fill_color(0.98, 0.99, 1.0)
            p1.rect(36, y - 3, 523, 15, fill=True)
        p1.text(42, y + 1, name, font="F2", size=8, r=0.1, g=0.1, b=0.15)
        p1.text(160, y + 1, role, font="F1", size=7.5, r=0.3, g=0.3, b=0.35)
        p1.text(260, y + 1, branch, font="F3", size=7.5, r=0.2, g=0.4, b=0.2)
        p1.text(330, y + 1, td, font="F2", size=8, r=0.1, g=0.5, b=0.2)
        p1.text(410, y + 1, tp, font="F2", size=8, r=0.08, g=0.45, b=0.18)
        p1.text(465, y + 1, pd, font="F1", size=7.5, r=0.2, g=0.3, b=0.5)
        p1.text(520, y + 1, pp, font="F2", size=8, r=0.15, g=0.35, b=0.7)
        y -= 15
        
    p1.set_stroke_color(0.8, 0.85, 0.9)
    p1.line(36, y + 10, 559, y + 10)
    
    # Section Title: Member 1 Deep Dive - Afridi
    y -= 10
    p1.set_fill_color(0.92, 0.96, 0.93)
    p1.set_stroke_color(0.14, 0.55, 0.25)
    p1.set_line_width(1)
    p1.rect(36, y - 2, 523, 20, fill=True, stroke=True)
    p1.text(44, y + 4, "MEMBER 1: MOSTAKIM HAWLADER AFRIDI — PLATFORM LEAD & REPO OWNER", font="F2", size=8.5, r=0.08, g=0.38, b=0.15)
    p1.text(440, y + 4, "DONE: 11/13 (84.6%) | 22/27 pts", font="F2", size=8, r=0.08, g=0.4, b=0.18)
    
    # Afridi Completed Table
    y -= 16
    p1.text(40, y, "Completed Tasks in Phase 1 (11 tasks):", font="F2", size=8, r=0.1, g=0.4, b=0.15)
    y -= 12
    p1.set_fill_color(0.94, 0.97, 0.94)
    p1.rect(36, y, 523, 12, fill=True)
    p1.text(40, y + 3, "ID", font="F2", size=7, r=0.2, g=0.3, b=0.2)
    p1.text(85, y + 3, "SIZE", font="F2", size=7, r=0.2, g=0.3, b=0.2)
    p1.text(125, y + 3, "SPRINT", font="F2", size=7, r=0.2, g=0.3, b=0.2)
    p1.text(165, y + 3, "TASK TITLE & ACCOMPLISHMENT", font="F2", size=7, r=0.2, g=0.3, b=0.2)
    
    afridi_done = [
        ("DB-1", "L (3pt)", "S1", "Initial schema migrations: enums, locations, profiles, user_roles, addresses"),
        ("DB-2", "S (1pt)", "S2", "Seed 8 divisions, 64 districts, and key upazilas with PostGIS coordinates"),
        ("DB-6", "L (3pt)", "S2", "RLS security framework: has_role, is_admin helpers, pgTAP harness, core policies"),
        ("AUTH-1", "L (3pt)", "S3", "Login with phone OTP (custom SMS Edge function) or email OTP on web & mobile"),
        ("AUTH-3", "S (1pt)", "S5", "First-launch language selection onboarding screens (Bangla / English)"),
        ("AUTH-4", "S (1pt)", "S4", "Location permission screen with GPS detection and 8-division manual fallback"),
        ("AUTH-5", "M (2pt)", "S4", "Multi-role selection, active role switcher chip, and role verification request flow"),
        ("ADM-1", "M (2pt)", "S4", "Admin verification review panel for vets, shelters, rescuers, and providers"),
        ("ADM-2", "M (2pt)", "S5", "Content moderation: remove fake listings/reports, clinic data moderation & abuse control"),
        ("ADM-3", "S (1pt)", "S4", "Admin urgent rescue report review queue with priority ordering & dispatch"),
        ("NOTIF-1", "L (3pt)", "S3", "In-app notifications inbox, Realtime listener, and notify() RPC framework"),
    ]
    y -= 13
    for tid, sz, sp, desc in afridi_done:
        p1.set_fill_color(0.85, 0.95, 0.85)
        p1.rect(38, y - 1, 38, 10, fill=True)
        p1.text(42, y + 1, tid, font="F4", size=6.5, r=0.08, g=0.4, b=0.15)
        p1.text(85, y + 1, sz, font="F1", size=7, r=0.3, g=0.3, b=0.3)
        p1.text(128, y + 1, sp, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p1.text(165, y + 1, desc[:82], font="F1", size=7, r=0.15, g=0.15, b=0.15)
        y -= 11.5
        
    # Afridi Pending
    y -= 2
    p1.text(40, y, "Pending Tasks in Phase 1 (2 tasks):", font="F2", size=8, r=0.4, g=0.4, b=0.45)
    y -= 12
    afridi_pending = [
        ("REL-1", "L (3pt)", "S7", "E2E automated tests for critical flows (test harness & CI integration)"),
        ("REL-3", "M (2pt)", "S8", "Play Store + App Store + pranora.com.bd production release and launch"),
    ]
    for tid, sz, sp, desc in afridi_pending:
        p1.set_fill_color(0.92, 0.93, 0.95)
        p1.rect(38, y - 1, 38, 10, fill=True)
        p1.text(42, y + 1, tid, font="F4", size=6.5, r=0.3, g=0.35, b=0.4)
        p1.text(85, y + 1, sz, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p1.text(128, y + 1, sp, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p1.text(165, y + 1, desc, font="F1", size=7, r=0.3, g=0.3, b=0.3)
        y -= 11.5
        
    draw_footer(p1, 1, 3)
    
    # =========================================================================
    # PAGE 2: Brehat Dey & Md Zeaul Hoque Zihad
    # =========================================================================
    p2 = doc.new_page()
    draw_header_banner(p2, 2, 3)
    
    # Member 2: Brehat Dey
    y = 730
    p2.set_fill_color(0.92, 0.95, 0.98)
    p2.set_stroke_color(0.18, 0.45, 0.75)
    p2.set_line_width(1)
    p2.rect(36, y - 2, 523, 20, fill=True, stroke=True)
    p2.text(44, y + 4, "MEMBER 2: BREHAT DEY — RESCUE & ADOPTION LEAD", font="F2", size=8.5, r=0.08, g=0.25, b=0.55)
    p2.text(440, y + 4, "DONE: 8/13 (61.5%) | 15/25 pts", font="F2", size=8, r=0.1, g=0.35, b=0.6)
    
    y -= 16
    p2.text(40, y, "Completed Tasks in Phase 1 (8 tasks):", font="F2", size=8, r=0.1, g=0.35, b=0.55)
    y -= 12
    p2.set_fill_color(0.93, 0.96, 0.99)
    p2.rect(36, y, 523, 12, fill=True)
    p2.text(40, y + 3, "ID", font="F2", size=7, r=0.2, g=0.25, b=0.3)
    p2.text(85, y + 3, "SIZE", font="F2", size=7, r=0.2, g=0.25, b=0.3)
    p2.text(125, y + 3, "SPRINT", font="F2", size=7, r=0.2, g=0.25, b=0.3)
    p2.text(165, y + 3, "TASK TITLE & ACCOMPLISHMENT", font="F2", size=7, r=0.2, g=0.25, b=0.3)
    
    brehat_done = [
        ("DB-8", "M (2pt)", "S2", "Migrations: rescue module (animal_reports, rescue_cases, lost_found_board view)"),
        ("DB-9", "M (2pt)", "S2", "Migrations: adoption module (listings, applications, handovers, favorites)"),
        ("RSC-1", "L (3pt)", "S3", "Report an animal (injured/lost/found/abandoned) web & mobile multi-step form"),
        ("RSC-3", "M (2pt)", "S4", "Assign rescuer; accept / decline assignment workflow and status notifications"),
        ("RSC-4", "M (2pt)", "S4", "Rescue case details page: status lifecycle, timeline notes, and photo uploads"),
        ("RSC-5", "S (1pt)", "S3", "Reporter status tracker (my_report_status) web and mobile real-time tracking"),
        ("RSC-7", "S (1pt)", "S4", "Record case outcome and close rescue case modal and resolution notes"),
        ("ADP-1", "M (2pt)", "S3", "Public adoption listings without login; species, age, and district filter sheets"),
    ]
    y -= 13
    for tid, sz, sp, desc in brehat_done:
        p2.set_fill_color(0.85, 0.92, 0.98)
        p2.rect(38, y - 1, 38, 10, fill=True)
        p2.text(42, y + 1, tid, font="F4", size=6.5, r=0.08, g=0.25, b=0.5)
        p2.text(85, y + 1, sz, font="F1", size=7, r=0.3, g=0.3, b=0.3)
        p2.text(128, y + 1, sp, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p2.text(165, y + 1, desc[:82], font="F1", size=7, r=0.15, g=0.15, b=0.15)
        y -= 11.5
        
    y -= 2
    p2.text(40, y, "Pending Tasks in Phase 1 (5 tasks):", font="F2", size=8, r=0.4, g=0.4, b=0.45)
    y -= 12
    brehat_pending = [
        ("RSC-6", "M (2pt)", "S5", "Urgent report alert (push + SMS) + 15-min automated escalation system"),
        ("ADP-2", "M (2pt)", "S5", "Create adoption listing from pet profile (verified shelter / approved owner)"),
        ("ADP-3", "M (2pt)", "S5", "Adoption application form & question answers submission flow"),
        ("ADP-4", "S (1pt)", "S6", "Adoption application status tracking interface for pet applicants"),
        ("ADP-6", "L (3pt)", "S6", "Two-sided handover & ownership transfer verification (one per listing)"),
    ]
    for tid, sz, sp, desc in brehat_pending:
        p2.set_fill_color(0.92, 0.93, 0.95)
        p2.rect(38, y - 1, 38, 10, fill=True)
        p2.text(42, y + 1, tid, font="F4", size=6.5, r=0.3, g=0.35, b=0.4)
        p2.text(85, y + 1, sz, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p2.text(128, y + 1, sp, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p2.text(165, y + 1, desc[:82], font="F1", size=7, r=0.3, g=0.3, b=0.3)
        y -= 11.5
        
    # Member 3: Md Zeaul Hoque Zihad
    y -= 12
    p2.set_fill_color(0.98, 0.95, 0.92)
    p2.set_stroke_color(0.85, 0.50, 0.15)
    p2.set_line_width(1)
    p2.rect(36, y - 2, 523, 20, fill=True, stroke=True)
    p2.text(44, y + 4, "MEMBER 3: MD ZEAUL HOQUE ZIHAD — PRODUCT, DESIGN & HEALTH LEAD", font="F2", size=8.5, r=0.55, g=0.3, b=0.08)
    p2.text(440, y + 4, "DONE: 11/13 (84.6%) | 25/28 pts", font="F2", size=8, r=0.6, g=0.35, b=0.1)
    
    y -= 16
    p2.text(40, y, "Completed Tasks in Phase 1 (11 tasks):", font="F2", size=8, r=0.55, g=0.3, b=0.08)
    y -= 12
    p2.set_fill_color(0.99, 0.96, 0.93)
    p2.rect(36, y, 523, 12, fill=True)
    p2.text(40, y + 3, "ID", font="F2", size=7, r=0.3, g=0.25, b=0.2)
    p2.text(85, y + 3, "SIZE", font="F2", size=7, r=0.3, g=0.25, b=0.2)
    p2.text(125, y + 3, "SPRINT", font="F2", size=7, r=0.3, g=0.25, b=0.2)
    p2.text(165, y + 3, "TASK TITLE & ACCOMPLISHMENT", font="F2", size=7, r=0.3, g=0.25, b=0.2)
    
    zihad_done = [
        ("I18N-1", "L (3pt)", "S1", "packages/i18n: bilingual dictionary framework, currency and date formatters"),
        ("I18N-2", "M (2pt)", "S5", "Language switcher toggle & persistence across web and mobile"),
        ("UI-1", "L (3pt)", "S2", "packages/ui: design tokens, color palette, and 28+ reusable base components"),
        ("DB-3", "L (3pt)", "S2", "Migrations: pets, breeds, ownership history, health tables, and pet_documents"),
        ("DB-7", "M (2pt)", "S3", "Seed catalog: 21 services, 44 animal breeds, and 14 core vaccine templates"),
        ("PET-1", "M (2pt)", "S3", "Pet management form: add/edit/delete pets, microchip, weight on web & mobile"),
        ("PET-5", "M (2pt)", "S4", "One profile for life: rescued animal profile, ownership transfer keeps records"),
        ("HLT-1", "L (3pt)", "S4", "Vaccine record + schedule auto-generation from database vaccine templates"),
        ("HLT-3", "M (2pt)", "S5", "Medical history (vet-written, owner read-only) + owner diagnostic uploads"),
        ("SVC-1", "M (2pt)", "S3", "Services directory tab / /services page rendered from database catalog"),
        ("REL-2", "S (1pt)", "S4", "Privacy policy & terms of service documentation (Bangla & English)"),
    ]
    y -= 13
    for tid, sz, sp, desc in zihad_done:
        p2.set_fill_color(0.98, 0.92, 0.85)
        p2.rect(38, y - 1, 38, 10, fill=True)
        p2.text(42, y + 1, tid, font="F4", size=6.5, r=0.5, g=0.25, b=0.08)
        p2.text(85, y + 1, sz, font="F1", size=7, r=0.3, g=0.3, b=0.3)
        p2.text(128, y + 1, sp, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p2.text(165, y + 1, desc[:82], font="F1", size=7, r=0.15, g=0.15, b=0.15)
        y -= 11.5
        
    y -= 2
    p2.text(40, y, "Pending Tasks in Phase 1 (2 tasks):", font="F2", size=8, r=0.4, g=0.4, b=0.45)
    y -= 12
    zihad_pending = [
        ("HLT-7", "M (2pt)", "S5", "Vet visit notes (clinical findings, diagnostics, prescription & treatment)"),
        ("REL-4", "S (1pt)", "S7", "Native Bangla speaker linguistic review of all system copy & messages"),
    ]
    for tid, sz, sp, desc in zihad_pending:
        p2.set_fill_color(0.92, 0.93, 0.95)
        p2.rect(38, y - 1, 38, 10, fill=True)
        p2.text(42, y + 1, tid, font="F4", size=6.5, r=0.3, g=0.35, b=0.4)
        p2.text(85, y + 1, sz, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p2.text(128, y + 1, sp, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p2.text(165, y + 1, desc[:82], font="F1", size=7, r=0.3, g=0.3, b=0.3)
        y -= 11.5
        
    draw_footer(p2, 2, 3)
    
    # =========================================================================
    # PAGE 3: Tain Tabassum, Zimia Samia & Project Roadmap
    # =========================================================================
    p3 = doc.new_page()
    draw_header_banner(p3, 3, 3)
    
    # Member 4: Tain Tabassum
    y = 730
    p3.set_fill_color(0.96, 0.94, 0.98)
    p3.set_stroke_color(0.55, 0.30, 0.75)
    p3.set_line_width(1)
    p3.rect(36, y - 2, 523, 20, fill=True, stroke=True)
    p3.text(44, y + 4, "MEMBER 4: TAIN TABASSUM — VET BOOKING & DASHBOARDS LEAD", font="F2", size=8.5, r=0.35, g=0.15, b=0.55)
    p3.text(440, y + 4, "DONE: 1/12 (8.3%) | 2/26 pts", font="F2", size=8, r=0.4, g=0.2, b=0.6)
    
    y -= 16
    p3.text(40, y, "Completed Tasks in Phase 1 (5 tasks):", font="F2", size=8, r=0.35, g=0.15, b=0.55)
    y -= 12
    p3.set_fill_color(0.85, 0.92, 0.98)
    p3.rect(38, y - 1, 38, 10, fill=True)
    p3.text(42, y + 1, "DB-5", font="F4", size=6.5, r=0.2, g=0.15, b=0.5)
    p3.text(85, y + 1, "M (2pt)", font="F1", size=7, r=0.3, g=0.3, b=0.3)
    p3.text(128, y + 1, "S2", font="F1", size=7, r=0.4, g=0.4, b=0.4)
    p3.text(165, y + 1, "Migrations: bookings, clinic availability rules (slot & serial modes), and RLS", font="F1", size=7, r=0.15, g=0.15, b=0.15)
    
    y -= 14
    p3.text(40, y, "Pending Tasks in Phase 1 (11 tasks):", font="F2", size=8, r=0.4, g=0.4, b=0.45)
    y -= 12
    tain_pending = [
        ("APT-1a", "L (3pt)", "S2", "available_slots + create_booking RPC functions (slots + serials)"),
        ("APT-1", "L (3pt)", "S3", "Booking flow (service -> pet -> slot/serial -> confirm) on web & mobile"),
        ("APT-2", "M (2pt)", "S3", "Appointment status lifecycle + provider confirmation flow"),
        ("APT-3", "M (2pt)", "S5", "Reschedule / cancel appointment until clinic cancellation cut-off"),
        ("APT-6", "M (2pt)", "S6", "Vet clinic schedule: weekly hours, holidays, slot/serial mode toggle"),
        ("PAY-1", "S (1pt)", "S3", "Cash payment at clinic support & receipt confirmation"),
        ("PRV-1", "M (2pt)", "S5", "Provider onboarding (profile info, map pin, hours, services, trade docs)"),
        ("PRV-2", "M (2pt)", "S5", "Provider dashboard: upcoming appointments, active schedule, serial queue"),
        ("PRV-3", "L (3pt)", "S4", "Shelter onboarding & dashboard (rescue queue, cases, listings, applications)"),
        ("RSC-2", "M (2pt)", "S4", "Review queue for shelter & admin with urgent rescue sorting"),
        ("ADP-5", "M (2pt)", "S6", "Human review & decision flow for adoption applications"),
    ]
    for tid, sz, sp, desc in tain_pending:
        p3.set_fill_color(0.92, 0.93, 0.95)
        p3.rect(38, y - 1, 38, 10, fill=True)
        p3.text(42, y + 1, tid, font="F4", size=6.5, r=0.3, g=0.35, b=0.4)
        p3.text(85, y + 1, sz, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p3.text(128, y + 1, sp, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p3.text(165, y + 1, desc[:82], font="F1", size=7, r=0.3, g=0.3, b=0.3)
        y -= 11.5
        
    # Member 5: Zimia Samia
    y -= 10
    p3.set_fill_color(0.98, 0.94, 0.95)
    p3.set_stroke_color(0.75, 0.25, 0.40)
    p3.set_line_width(1)
    p3.rect(36, y - 2, 523, 20, fill=True, stroke=True)
    p3.text(44, y + 4, "MEMBER 5: ZIMIA SAMIA — VET DISCOVERY & CLINICS LEAD", font="F2", size=8.5, r=0.55, g=0.15, b=0.25)
    p3.text(440, y + 4, "DONE: 5/13 (38.5%) | 11/26 pts", font="F2", size=8, r=0.6, g=0.2, b=0.3)
    
    y -= 16
    p3.text(40, y, "Completed Tasks in Phase 1 (5 tasks):", font="F2", size=8, r=0.55, g=0.15, b=0.25)
    y -= 12
    p3.set_fill_color(0.98, 0.88, 0.90)
    p3.rect(38, y - 1, 38, 10, fill=True)
    p3.text(42, y + 1, "DB-4", font="F4", size=6.5, r=0.5, g=0.15, b=0.25)
    p3.text(85, y + 1, "M (2pt)", font="F1", size=7, r=0.3, g=0.3, b=0.3)
    p3.text(128, y + 1, "S2", font="F1", size=7, r=0.4, g=0.4, b=0.4)
    p3.text(165, y + 1, "Migrations: providers, locations, operating hours, vets, provider services, documents", font="F1", size=7, r=0.15, g=0.15, b=0.15)
    
    y -= 14
    p3.text(40, y, "Pending Tasks in Phase 1 (8 tasks):", font="F2", size=8, r=0.4, g=0.4, b=0.45)
    y -= 12
    zimia_pending = [
        ("MAP-1", "L (3pt)", "S2", "nearby_clinics + is_location_open SQL PostGIS spatial functions"),
        ("MAP-1a", "M (2pt)", "S4", "App nearest-vet map screen with GPS markers (react-native-maps)"),
        ("MAP-1b", "M (2pt)", "S4", "Web nearest-vet map page (Google Maps JavaScript API split view)"),
        ("MAP-2", "M (2pt)", "S4", "Distance-sorted clinic list & bottom sheet with live open/closed badges"),
        ("MAP-3", "M (2pt)", "S5", "Clinic filters (open now, 24/7, emergency, species, fee, government)"),
        ("MAP-4", "M (2pt)", "S6", "Area search & division/district/upazila geographic picker"),
        ("MAP-5", "M (2pt)", "S3", "Clinic details page with photos, schedule, doctors, and service fees"),
        ("MAP-6", "S (1pt)", "S3", "Call / Directions / Book quick action buttons"),
        ("MAP-7", "M (2pt)", "S5", "Emergency mode: 1-tap route navigation to nearest open 24/7 emergency clinic"),
        ("MAP-SEED", "L (3pt)", "S3", "Seed clinic dataset (DLS government upazila hospitals + Dhaka clinics)"),
        ("SVC-2", "M (2pt)", "S5", "Provider list per service (list view & map view toggle)"),
        ("REL-5", "S (1pt)", "S6", "Licensed veterinarian review: BVC registration validation & legal review"),
    ]
    for tid, sz, sp, desc in zimia_pending:
        p3.set_fill_color(0.92, 0.93, 0.95)
        p3.rect(38, y - 1, 38, 10, fill=True)
        p3.text(42, y + 1, tid, font="F4", size=6.5, r=0.3, g=0.35, b=0.4)
        p3.text(85, y + 1, sz, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p3.text(128, y + 1, sp, font="F1", size=7, r=0.4, g=0.4, b=0.4)
        p3.text(165, y + 1, desc[:82], font="F1", size=7, r=0.3, g=0.3, b=0.3)
        y -= 11.5
        
    draw_footer(p3, 3, 3)
    
    # Save document
    doc.save(pdf_path)

if __name__ == "__main__":
    target = "/Users/mostakimhawladerafridi/Desktop/Project/Pranora/docs/Pranora_Phase1_Progress_Report.pdf"
    build_full_report(target)

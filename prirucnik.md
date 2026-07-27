# Priručnik za Administratore: Upravljanje Korisnicima

Ovaj sistem koristi **dvodelnu autentifikaciju**. To znači da se pristup aplikaciji i dozvole kontrolišu kroz dva odvojena sistema koji moraju biti ručno sinhronizovani:
1. **Clerk** (Sistem za ulogovanje / Sigurnost)
2. **PostgreSQL Baza** (Tvoja baza gde se čuvaju podaci o firmama i rolama)

> UPOZORENJE: Zbog sigurnosti i arhitekture sistema, opcija za "Sign Up" (samostalno registrovanje) je namerno isključena. **Samo administratori mogu da kreiraju nove naloge** prateći korake ispod.

---

## 🛠️ Koraci za kreiranje novog dispečera ili admina

Kada nova firma, admin ili dispečer treba da dobije pristup sistemu, isprati sledeća 3 koraka.

### Korak 1: Kreiranje Firme u bazi
Korisnik mora biti dodeljen nekoj firmi. Ako firma već postoji u bazi, preskoči ovaj korak.
Ako je nova firma:
1. Otvori svoju bazu (Supabase ili Prisma Studio).
2. Dodaj novi red u tabelu `Company`.
   - `id`: *generiše se automatski (ili unesi sam)*
   - `name`: Ime firme (npr. "Kamiondžije DOO")
3. **Zabeleži `id` firme** jer će ti trebati za Korak 3!

### Korak 2: Kreiranje naloga u Clerk-u
Ovo omogućava dispečeru da se uopšte uloguje u sistem.
1. Uloguj se na tvoj **Clerk Dashboard**.
2. Idi na sekciju **Users** -> **Create user**.
3. **Username**: Unesi jedinstveno korisničko ime (npr. `ivan_kamiondzije`). 
   - *Napomena: Username mora biti jedinstven u celom sistemu! Ne mogu dva korisnika imati isti username čak ni ako su iz različitih firmi.*
4. **Password**: Unesi lozinku i sačuvaj korisnika.
5. Nakon što je korisnik kreiran, otvori njegov profil u Clerk-u.
6. **Kopiraj `User ID`** (Počinje sa `user_...`). Ovo je `clerkId` koji nam treba za sledeći korak.

### Korak 3: Povezivanje korisnika u Bazi (PostgreSQL)
Sada moramo da kažemo našoj aplikaciji kojoj firmi taj Clerk korisnik pripada.
1. Otvori bazu (Supabase ili Prisma Studio) i idi na tabelu `User`.
2. Dodaj novi red i popuni kolone:
   - `username`: Isti onaj koji si uneo u Clerk-u (npr. `ivan_kamiondzije`)
   - `clerkId`: Onaj `User ID` što si iskopirao iz Clerk-a (npr. `user_2abc...`)
   - `companyId`: ID firme iz Koraka 1.
   - `role`: Odaberi `ADMIN`, `DISPATCHER` ili `DRIVER`.
3. Sačuvaj red.

✅ **GOTOVO!** Zaposleni sada može da ode na aplikaciju, klikne "Uloguj se", unese svoj username i password, i videće isključivo podatke firme kojoj je dodeljen u bazi.

---

## 💡 Često postavljana pitanja (FAQ)

### Šta ako korisnik zaboravi šifru?
Korisnici ne mogu sami da resetuju šifru jer nemaju povezan email. Administrator mora da ode u **Clerk Dashboard**, nađe korisnika, i izabere opciju **Set password** ili da mu ručno promeni lozinku i javi mu.

### Da li jedan dispečer može da radi za dve firme?
Ne preko istog naloga. Pošto `username` mora biti jedinstven, ako "Ivan" radi i za firmu A i za firmu B, moraćeš da mu napraviš dva naloga:
- `ivan_firmaA` -> povezan sa `companyId` od firme A
- `ivan_firmaB` -> povezan sa `companyId` od firme B

### Gde se nalaze podaci i zašto nema šifre u našoj bazi?
Ovo je **najbitnija stvar za razumevanje**:
- **Clerk čuva šifre!** Nalog bez šifre ne može da radi, ali tu šifru korisnik ukucava u Clerk (koji je zadužen isključivo za bezbednost i logovanje). Naša PostgreSQL baza **nikada, ni pod kojim uslovima** ne sme da čuva šifre korisnika. Zato kolona `password` ne postoji u bazi.
- **Naša baza čuva dozvole i podatke firme.** Ture, kamioni, rolne i povezanost sa firmom (`companyId`) žive u našoj PostgreSQL bazi.
Kada se korisnik uloguje u Clerk pomoću svog username-a i šifre, Clerk nam kaže: "Ovaj čovek sa ID-em `user_2abc...` je prošao bezbednosnu proveru i ulogovan je". Zatim naša aplikacija uzme taj ID, ode u našu bazu i kaže: "Nađi mi kome pripada `user_2abc...` i daj mu njegove kamione". Zato je `clerkId` most između ova dva sistema!

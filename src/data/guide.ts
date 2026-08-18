import type { Locale } from "@/lib/i18n";

export type GuideStep = { title: string; body: string };
export type GuideTrack = { title: string; intro: string; steps: GuideStep[] };

export type GuideCopy = {
  title: string;
  lede: string;
  student: GuideTrack;
  teacher: GuideTrack;
};

export const GUIDE: Record<Locale, GuideCopy> = {
  en: {
    title: "User guide",
    lede: "How students learn and how teachers publish at the National Education Center.",
    student: {
      title: "Student",
      intro:
        "A student account lets you enroll, watch lectures, keep notes, and pick up exactly where you stopped.",
      steps: [
        {
          title: "Create an account",
          body: "Open Log in → Sign up. Use your email and a password of at least 8 characters. Google and X are not used on the live site — email is the independent path. After you sign up you land on the home page as a student.",
        },
        {
          title: "Choose a language",
          body: "Use EN / IT / বাং in the top bar. Menus, buttons, and this guide switch immediately. Your choice is saved in the browser.",
        },
        {
          title: "Find a course",
          body: "Explore or Courses opens the catalog. Search CAF, A2, Patente B, dichiarazione, or pick a desk: tax, CAF, Italian language, driving licence, immigration, work. Open any card to read the syllabus.",
        },
        {
          title: "Enroll",
          body: "On the course page tap Enroll now or Add to My learning. You can also add a course to your wishlist without enrolling. Preview lectures play without an account; full lectures need a sign-in.",
        },
        {
          title: "Watch a lecture",
          body: "The player saves your place about every four seconds, and again when you pause or finish. Space plays and pauses. Mark a lecture complete when you are done, or let the end of the video do it.",
        },
        {
          title: "Take notes",
          body: "On the watch page, write in the notes panel. Notes are saved to your account for that lecture so you can return to them later.",
        },
        {
          title: "Track progress",
          body: "Dashboard shows courses, finished lectures, and time watched, plus a Continue card. Progress lists every enrolled course with a checklist. My learning holds enrollments; Wishlist holds saved courses.",
        },
        {
          title: "Switch role later",
          body: "On Dashboard, Your access lets you open Teacher or Admin on the same account. Use Student again to return to learning.",
        },
      ],
    },
    teacher: {
      title: "Teacher",
      intro:
        "The studio is where you draft a course, add lectures, publish to the catalog, and see who enrolled.",
      steps: [
        {
          title: "Open teacher access",
          body: "Sign in, go to Dashboard, and switch role to Teacher. Or open Teach and apply — an admin can approve you. Admins already have studio access.",
        },
        {
          title: "Enter the studio",
          body: "Teach in the header opens your course list: drafts, published count, lectures, and students. New course starts a draft. Nothing is public until you publish.",
        },
        {
          title: "Create a course",
          body: "Give it a title, short subtitle, description, desk (category), level, poster, and instructor name. Save. You are taken to the editor to add lectures.",
        },
        {
          title: "Add lectures",
          body: "Open the Lectures tab. Set a title, summary, optional transcript. Pick a library clip, upload an MP4/WebM (up to 4 MB), or paste a hosted MP4 / YouTube / Vimeo URL. Upload a poster photo or paste an image URL in Details. Turn Preview on if guests may watch that lesson without enrolling. Add at least one lecture before you publish.",
        },
        {
          title: "Edit and reorder",
          body: "Arrows change lecture order. Edit a lesson to change the video or copy. Delete a lesson you no longer need. Details updates title, poster, and instructor. Students lists everyone enrolled. Admins tap Edit content on a catalogue course to change the demo lessons and media.",
        },
        {
          title: "Publish",
          body: "Publish puts the course in the public catalog. Unpublish hides it again but keeps enrollments and progress. Students can then open the course page and start watching.",
        },
        {
          title: "Teach well",
          body: "Keep lessons short — one form, one desk, one conversation. Write the summary as the thing a student can do after the last minute. Check the Students tab after you go live.",
        },
      ],
    },
  },
  it: {
    title: "Guida utente",
    lede: "Come gli studenti imparano e come i docenti pubblicano al Centro Nazionale di Formazione.",
    student: {
      title: "Studente",
      intro:
        "Un account studente serve per iscriversi, guardare le lezioni, tenere appunti e riprendere esattamente da dove ti sei fermato.",
      steps: [
        {
          title: "Crea un account",
          body: "Apri Accedi → Registrati. Usa l'email e una password di almeno 8 caratteri. Google e X non sono usati sul sito live — il percorso indipendente è l'email. Dopo la registrazione sei uno studente.",
        },
        {
          title: "Scegli la lingua",
          body: "Usa EN / IT / বাং nella barra in alto. Menu, pulsanti e questa guida cambiano subito. La scelta resta nel browser.",
        },
        {
          title: "Trova un corso",
          body: "Esplora o Corsi apre il catalogo. Cerca CAF, A2, Patente B, dichiarazione, oppure scegli uno sportello. Apri una scheda per leggere il programma.",
        },
        {
          title: "Iscriviti",
          body: "Nella pagina del corso tocca Iscriviti ora o aggiungi a I miei corsi. Puoi anche salvare un corso in lista desideri senza iscriverti. Le anteprime si vedono senza account; le lezioni complete richiedono l'accesso.",
        },
        {
          title: "Guarda una lezione",
          body: "Il lettore salva il punto ogni quattro secondi circa, e di nuovo in pausa o a fine video. Lo spazio avvia e ferma. Segna la lezione come completata, o lascia che lo faccia la fine del video.",
        },
        {
          title: "Prendi appunti",
          body: "Nella pagina di visione scrivi nel pannello note. Restano sul tuo account per quella lezione.",
        },
        {
          title: "Segui i progressi",
          body: "Il Pannello mostra corsi, lezioni finite e tempo visto, più una scheda Continua. Progressi elenca ogni corso con una checklist. I miei corsi tiene le iscrizioni; Lista desideri i corsi salvati.",
        },
        {
          title: "Cambia ruolo dopo",
          body: "Nel Pannello, Il tuo accesso apre Docente o Admin sullo stesso account. Torna a Studente per riprendere a imparare.",
        },
      ],
    },
    teacher: {
      title: "Docente",
      intro:
        "Nello studio prepari un corso, aggiungi lezioni, pubblichi in catalogo e vedi chi si è iscritto.",
      steps: [
        {
          title: "Apri l'accesso docente",
          body: "Accedi, vai al Pannello e passa al ruolo Docente. Oppure apri Insegna e fai domanda — un admin può approvare. Gli admin hanno già lo studio.",
        },
        {
          title: "Entra nello studio",
          body: "Insegna nell'intestazione apre l'elenco corsi: bozze, pubblicati, lezioni e studenti. Nuovo corso crea una bozza. Niente è pubblico finché non pubblichi.",
        },
        {
          title: "Crea un corso",
          body: "Titolo, sottotitolo, descrizione, sportello (categoria), livello, locandina e nome del docente. Salva. Passi all'editor per le lezioni.",
        },
        {
          title: "Aggiungi lezioni",
          body: "Apri la scheda Lezioni. Titolo, sintesi, eventuale trascrizione. Scegli un video dalla libreria o incolla un URL. Attiva Anteprima se gli ospiti possono vederla senza iscrizione. Serve almeno una lezione prima di pubblicare.",
        },
        {
          title: "Modifica e riordina",
          body: "Le frecce cambiano l'ordine. Modifica una lezione per video o testo. Elimina se non serve più. Dettagli aggiorna titolo e locandina. Studenti elenca gli iscritti.",
        },
        {
          title: "Pubblica",
          body: "Pubblica mette il corso in catalogo. Togli dalla pubblicazione per nasconderlo: iscrizioni e progressi restano. Gli studenti possono allora aprire la pagina e guardare.",
        },
        {
          title: "Insegna bene",
          body: "Lezioni brevi: un modulo, uno sportello, una conversazione. La sintesi è ciò che lo studente sa fare dopo l'ultimo minuto. Controlla Studenti dopo la messa online.",
        },
      ],
    },
  },
  bn: {
    title: "ব্যবহারকারী নির্দেশিকা",
    lede: "ন্যাশনাল এডুকেশন সেন্টারে শিক্ষার্থী কীভাবে শেখে এবং শিক্ষক কীভাবে প্রকাশ করেন।",
    student: {
      title: "শিক্ষার্থী",
      intro:
        "শিক্ষার্থী অ্যাকাউন্ট দিয়ে ভর্তি হতে, লেকচার দেখতে, নোট রাখতে এবং থেমে যাওয়া জায়গা থেকে আবার শুরু করতে পারেন।",
      steps: [
        {
          title: "অ্যাকাউন্ট খুলুন",
          body: "লগ ইন → সাইন আপ খুলুন। ইমেইল এবং কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন। লাইভ সাইটে Google ও X নেই — ইমেইলই স্বাধীন পথ। সাইন আপের পর আপনি শিক্ষার্থী।",
        },
        {
          title: "ভাষা বেছে নিন",
          body: "উপরের বারে EN / IT / বাং ব্যবহার করুন। মেনু, বোতাম ও এই নির্দেশিকা সঙ্গে সঙ্গে বদলায়। পছন্দ ব্রাউজারে সেভ থাকে।",
        },
        {
          title: "কোর্স খুঁজুন",
          body: "ঘুরে দেখুন বা কোর্স ক্যাটালগ খোলে। CAF, A2, Patente B, dichiarazione খুঁজুন, অথবা ডেস্ক বেছে নিন। সিলেবাস পড়তে কার্ড খুলুন।",
        },
        {
          title: "ভর্তি হোন",
          body: "কোর্স পাতায় এখনই ভর্তি হোন বা আমার শিক্ষায় যোগ করুন। ভর্তি ছাড়াই উইশলিস্টে রাখতে পারেন। প্রিভিউ অ্যাকাউন্ট ছাড়া চলে; পুরো লেকচারের জন্য লগ ইন লাগে।",
        },
        {
          title: "লেকচার দেখুন",
          body: "প্লেয়ার প্রায় চার সেকেন্ডে একবার জায়গা সেভ করে, পজ বা শেষে আবার সেভ হয়। স্পেস প্লে/পজ। শেষে সম্পন্ন চিহ্ন দিন, অথবা ভিডিও শেষ হতে দিন।",
        },
        {
          title: "নোট রাখুন",
          body: "ওয়াচ পাতার নোট প্যানেলে লিখুন। সেই লেকচারের নোট আপনার অ্যাকাউন্টে থাকে।",
        },
        {
          title: "অগ্রগতি দেখুন",
          body: "ড্যাশবোর্ডে কোর্স, শেষ লেকচার, দেখা সময় এবং চালিয়ে যান কার্ড। অগ্রগতিতে প্রতিটি কোর্সের চেকলিস্ট। আমার শিক্ষায় ভর্তি; উইশলিস্টে সেভ করা কোর্স।",
        },
        {
          title: "পরে ভূমিকা বদলান",
          body: "ড্যাশবোর্ডে আপনার অ্যাক্সেস দিয়ে একই অ্যাকাউন্টে শিক্ষক বা অ্যাডমিন খুলুন। শেখায় ফিরতে আবার শিক্ষার্থী বেছে নিন।",
        },
      ],
    },
    teacher: {
      title: "শিক্ষক",
      intro:
        "স্টুডিওতে কোর্সের খসড়া তৈরি, লেকচার যোগ, ক্যাটালগে প্রকাশ এবং ভর্তি দেখা যায়।",
      steps: [
        {
          title: "শিক্ষক অ্যাক্সেস খুলুন",
          body: "লগ ইন করে ড্যাশবোর্ডে গিয়ে ভূমিকা শিক্ষক করুন। অথবা শেখান খুলে আবেদন করুন — অ্যাডমিন অনুমোদন দিতে পারেন। অ্যাডমিনের স্টুডিও আগে থেকেই আছে।",
        },
        {
          title: "স্টুডিওতে ঢুকুন",
          body: "হেডারে শেখান খুললে কোর্স তালিকা: খসড়া, প্রকাশিত, লেকচার, শিক্ষার্থী। নতুন কোর্স খসড়া তৈরি করে। প্রকাশ না করা পর্যন্ত কিছুই পাবলিক নয়।",
        },
        {
          title: "কোর্স তৈরি করুন",
          body: "শিরোনাম, উপশিরোনাম, বিবরণ, ডেস্ক (বিভাগ), স্তর, পোস্টার ও শিক্ষকের নাম দিন। সেভ করুন। তারপর এডিটরে লেকচার যোগ করুন।",
        },
        {
          title: "লেকচার যোগ করুন",
          body: "লেকচার ট্যাব খুলুন। শিরোনাম, সারসংক্ষেপ, ইচ্ছেমতো ট্রান্সক্রিপ্ট। লাইব্রেরি থেকে ক্লিপ নিন বা ভিডিও URL দিন। অতিথিরা ভর্তি ছাড়া দেখতে পারলে প্রিভিউ চালু রাখুন। প্রকাশের আগে অন্তত একটি লেকচার লাগে।",
        },
        {
          title: "সম্পাদনা ও সাজান",
          body: "তীর দিয়ে ক্রম বদলান। ভিডিও বা লেখা বদলাতে সম্পাদনা করুন। দরকার না হলে মুছুন। বিস্তারিত ট্যাবে শিরোনাম ও পোস্টার। শিক্ষার্থী ট্যাবে ভর্তির তালিকা।",
        },
        {
          title: "প্রকাশ করুন",
          body: "প্রকাশ করলে কোর্স পাবলিক ক্যাটালগে যায়। আনপাবলিশ করলে লুকিয়ে যায়, ভর্তি ও অগ্রগতি থাকে। তারপর শিক্ষার্থীরা পাতা খুলে দেখতে পারে।",
        },
        {
          title: "ভালো করে শেখান",
          body: "পাঠ ছোট রাখুন — এক ফর্ম, এক ডেস্ক, এক কথোপকথন। সারসংক্ষেপ হোক শেষ মিনিটের পর শিক্ষার্থী যা করতে পারে। লাইভ হলে শিক্ষার্থী ট্যাব দেখুন।",
        },
      ],
    },
  },
};

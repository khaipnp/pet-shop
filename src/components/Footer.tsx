"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  Shop: [
    { href: "/shop", label: "All Products" },
    { href: "/shop/toys", label: "Toys" },
    { href: "/shop/treats", label: "Treats" },
    { href: "/shop/beds", label: "Beds & Accessories" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/shipping", label: "Shipping & Returns" },
  ],
  Support: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/account", label: "My Account" },
  ],
};

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg
        className="size-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 0 1 1.772 1.153 4.902 4.902 0 0 1 1.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 0 1-1.153 1.772 4.902 4.902 0 0 1-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 0 1-1.772-1.153 4.902 4.902 0 0 1-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 0 1 1.153-1.772A4.902 4.902 0 0 1 6.08 2.525c.636-.247 1.363-.416 2.427-.465C8.552 2.013 8.907 2 11.338 2h.977Zm-.315 2.25h-.78c-2.36 0-2.87.01-3.88.056-1.03.047-1.59.21-1.96.348-.491.18-.84.396-1.208.764-.367.367-.583.716-.763 1.208-.138.37-.301.93-.348 1.96-.045.99-.056 1.5-.056 3.86v.78c0 2.36.01 2.87.056 3.88.047 1.03.21 1.59.348 1.96.18.491.396.84.763 1.208.367.367.716.583 1.208.763.37.138.93.301 1.96.348.99.045 1.5.056 3.86.056h.78c2.36 0 2.87-.01 3.88-.056 1.03-.047 1.59-.21 1.96-.348.491-.18.84-.396 1.208-.763.367-.367.583-.716.763-1.208.138-.37.301-.93.348-1.96.045-1.01.056-1.52.056-3.88v-.78c0-2.36-.01-2.87-.056-3.88-.047-1.03-.21-1.59-.348-1.96-.18-.491-.396-.84-.763-1.208a3.248 3.248 0 0 0-1.208-.763c-.37-.138-.93-.301-1.96-.348-1.01-.045-1.52-.056-3.88-.056Zm0 3.804a4.193 4.193 0 1 0 0 8.386 4.193 4.193 0 0 0 0-8.386Zm-4.193 4.193a4.193 4.193 0 1 1 8.386 0 4.193 4.193 0 0 1-8.386 0Zm5.899-4.404a.98.98 0 1 0 0-1.96.98.98 0 0 0 0 1.96Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg
        className="size-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "#",
    icon: (
      <svg
        className="size-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M13.682 10.622 20.239 3h-1.554l-5.693 6.618L8.158 3H2.5l6.876 10.007L2.5 21h1.554l6.012-6.989L15.842 21h5.658l-7.818-11.378ZM10.91 13.09l-.968-1.382-6.2-8.87h2.388l4.64 6.638.968 1.382 6.02 8.611h-2.388l-4.46-6.38Z" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "#",
    icon: (
      <svg
        className="size-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.087-.79-.166-2.004.035-2.868.182-.78 1.172-4.971 1.172-4.971s-.299-.599-.299-1.484c0-1.39.806-2.428 1.81-2.428.853 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.329-.236.995.5 1.807 1.48 1.807 1.777 0 3.143-1.874 3.143-4.579 0-2.394-1.72-4.068-4.177-4.068-2.845 0-4.515 2.134-4.515 4.34 0 .859.33 1.78.744 2.282a.3.3 0 0 1 .069.287c-.076.316-.245.995-.278 1.134-.043.183-.145.222-.334.134-1.247-.58-2.027-2.4-2.027-3.863 0-3.146 2.286-6.036 6.59-6.036 3.46 0 6.148 2.466 6.148 5.762 0 3.439-2.168 6.208-5.176 6.208-1.01 0-1.96-.524-2.286-1.144l-.622 2.372c-.226.87-.835 1.958-1.244 2.622.936.29 1.93.446 2.958.446 5.523 0 10-4.477 10-10S17.523 2 12 2Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-border bg-card">
      <div className="container-page py-12">
        {/* ── Grid ────────────────────────────────── */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-xl font-bold text-primary-dark"
            >
              <span className="text-2xl">🐾</span>
              <span>Scrumbles</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Bringing joy to pets and their humans with playful, pastel
              products designed with love.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-gray-800">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gray-500 transition-colors hover:text-primary-dark"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ──────────────────────────── */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            &copy; {year} Scrumbles. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-muted hover:text-primary-dark"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

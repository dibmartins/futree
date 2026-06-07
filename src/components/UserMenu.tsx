"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface UserMenuProps {
  isLoggedIn?: boolean;
  userImage?: string | null;
  userName?: string | null;
}

export default function UserMenu({ isLoggedIn, userImage, userName }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4 relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white/70 hover:text-primary-fixed transition-colors active:scale-95 duration-150"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a1c1c] border border-white/10 rounded-2xl shadow-2xl py-2 z-[60] overflow-hidden">
          {isLoggedIn ? (
            <>
              <div className="px-4 py-3 border-b border-white/5 mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden relative flex-shrink-0">
                  {userImage ? (
                    <Image
                      src={userImage}
                      alt={userName || "User"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/30 text-xl">person</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-stat text-white/40 uppercase tracking-widest">Conectado como</p>
                  <p className="text-sm font-display font-bold text-white truncate">{userName || "Atleta"}</p>
                </div>
              </div>

              {pathname !== "/settings" && (
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-primary hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                  Configurações
                </Link>
              )}

              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-primary hover:bg-white/5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">login</span>
                Login
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-3 px-4 py-3 text-sm text-primary-fixed hover:text-primary-fixed-dim hover:bg-white/5 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                Crie seu perfil
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

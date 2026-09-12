'use client'

import { motion } from 'framer-motion'
import { Archive, Download, FilePlus2, Moon, PanelLeftClose, Search, Star, Sun, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import PageTree from './PageTree'
import type { Page } from '@/lib/storage'

type SidebarProps = {
  pages: Page[]
  trashCount: number
  recent: Page[]
  activePageId: string
  dark: boolean
  onSelect: (id: string) => void
  onCreate: (parentId?: string | null) => void
  onSearch: () => void
  onFavorite: (id: string) => void
  onTrash: () => void
  onExport: () => void
  onImport: () => void
  onToggleTheme: () => void
  onToggleOpen: () => void
  onCloseMobile?: () => void
  mobile?: boolean
}

function NavButton({ icon, children, onClick, active = false }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`group h-9 w-full justify-start gap-2 rounded-[7px] px-2.5 text-[13px] font-medium transition-colors duration-100 active:scale-[.99] ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/72 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'}`}
    >
      <span className="grid size-5 shrink-0 place-items-center text-sidebar-foreground/50 transition-colors group-hover:text-current">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
    </Button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="px-2.5 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[.14em] text-sidebar-foreground/38">{children}</div>
}

export default function Sidebar(props: SidebarProps) {
  const favorites = props.pages.filter((page) => page.favorite && !page.trashedAt).slice(0, 5)

  return (
    <motion.aside
      initial={props.mobile ? { x: '-100%' } : false}
      animate={{ x: 0 }}
      exit={props.mobile ? { x: '-100%' } : undefined}
      transition={{ duration: .16, ease: 'easeOut' }}
      className={`${props.mobile ? 'fixed inset-y-0 left-0 z-50 w-[min(88vw,320px)] shadow-[12px_0_30px_rgba(0,0,0,.18)] md:hidden' : 'hidden w-[248px] shrink-0 md:flex'} flex flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground`}
      data-sidebar="shell"
    >
      <div className="flex h-12 shrink-0 items-center gap-2 px-3">
        <div className="grid size-7 shrink-0 place-items-center rounded-[7px] bg-sidebar-primary text-sidebar-primary-foreground">
          <span className="text-[12px] font-bold tracking-[-.06em]">N</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold">Nupoo</div>
          <div className="text-[9px] uppercase tracking-[.16em] text-sidebar-foreground/32">Local workspace</div>
        </div>
        {props.mobile ? (
          <Button variant="ghost" size="icon-sm" onClick={props.onCloseMobile ?? props.onToggleOpen} className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label="Zavřít panel"><X size={15} /></Button>
        ) : (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={props.onToggleOpen} className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label="Skrýt panel"><PanelLeftClose size={15} /></Button></TooltipTrigger>
              <TooltipContent>Schovat panel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="px-2">
        <motion.button
          whileTap={{ scale: .99 }}
          onClick={props.onSearch}
          className="flex h-9 w-full items-center gap-2 rounded-[7px] border border-sidebar-border bg-sidebar-accent/35 px-2.5 text-left text-[12px] text-sidebar-foreground/58 transition-colors duration-100 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
        >
          <Search size={14} />
          <span className="min-w-0 flex-1 truncate">Hledat</span>
          <kbd className="rounded-[5px] border border-sidebar-border bg-sidebar-background/50 px-1.5 py-0.5 font-mono text-[9px] text-sidebar-foreground/38">⌘K</kbd>
        </motion.button>
      </div>

      <div className="px-2 pt-2">
        <Button onClick={() => props.onCreate(null)} className="h-9 w-full justify-start gap-2 rounded-[7px] border border-sidebar-border bg-sidebar-primary px-2.5 text-[13px] font-medium text-sidebar-primary-foreground shadow-none hover:bg-sidebar-primary/92">
          <FilePlus2 size={15} />
          <span className="flex-1 text-left">Nová stránka</span>
          <kbd className="rounded-[5px] border border-sidebar-primary-foreground/15 bg-sidebar-primary-foreground/10 px-1.5 py-0.5 font-mono text-[9px] text-sidebar-primary-foreground/55">⌘N</kbd>
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {favorites.length > 0 && (
          <section>
            <SectionTitle>Oblíbené</SectionTitle>
            <div className="space-y-0.5">
              {favorites.map((page) => <NavButton key={page.id} icon={<Star size={13} className="fill-current" />} active={props.activePageId === page.id} onClick={() => props.onSelect(page.id)}>{page.title || 'Bez názvu'}</NavButton>)}
            </div>
          </section>
        )}

        <section>
          <SectionTitle>Stránky</SectionTitle>
          <div className="px-0.5">
            <PageTree pages={props.pages} activeId={props.activePageId} onSelect={props.onSelect} onFavorite={props.onFavorite} onAddChild={(id) => props.onCreate(id)} />
          </div>
        </section>

        {props.recent.length > 0 && (
          <section>
            <SectionTitle><span className="inline-flex items-center gap-1.5"><Archive size={10} /> Nedávné</span></SectionTitle>
            <div className="space-y-0.5">
              {props.recent.map((page) => <NavButton key={page.id} icon={<span className="text-[12px]">{page.icon || '◻'}</span>} active={props.activePageId === page.id} onClick={() => props.onSelect(page.id)}>{page.title || 'Bez názvu'}</NavButton>)}
            </div>
          </section>
        )}
      </div>

      <div className="shrink-0 border-t border-sidebar-border p-2">
        <div className="grid grid-cols-3 gap-0.5">
          <TooltipProvider delayDuration={300}>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={props.onTrash} className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label="Koš"><Trash2 size={14} />{props.trashCount > 0 && <span className="absolute right-1 top-1 grid size-3 place-items-center rounded-full bg-sidebar-primary text-[7px] text-sidebar-primary-foreground">{props.trashCount > 9 ? '9+' : props.trashCount}</span>}</Button></TooltipTrigger><TooltipContent>Koš</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={props.onExport} className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label="Exportovat"><Download size={14} /></Button></TooltipTrigger><TooltipContent>Exportovat</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={props.onImport} className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label="Importovat"><Upload size={14} /></Button></TooltipTrigger><TooltipContent>Importovat</TooltipContent></Tooltip>
          </TooltipProvider>
        </div>
        <Button variant="ghost" onClick={props.onToggleTheme} className="mt-0.5 h-9 w-full justify-start gap-2 rounded-[7px] px-2.5 text-[12px] text-sidebar-foreground/58 hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <span className="grid size-5 place-items-center">{props.dark ? <Sun size={14} /> : <Moon size={14} />}</span>
          {props.dark ? 'Světlý režim' : 'Tmavý režim'}
          <span className="ml-auto text-[10px] text-sidebar-foreground/32">{props.dark ? 'Dark' : 'Light'}</span>
        </Button>
      </div>
    </motion.aside>
  )
}

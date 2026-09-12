'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Focus, Loader2, Moon, PanelLeft, Redo2, Search, Sun, Trash2, Undo2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { dataService } from '@/lib/data-service'
import { downloadExport, parseImport } from '@/lib/export'
import { useNupooStore } from '@/lib/store'
import type { Page } from '@/lib/storage'
import CommandPalette from './CommandPalette'
import Editor from './Editor'
import Sidebar from './Sidebar'
import TrashDialog from './TrashDialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function Breadcrumbs({ pages, current, onSelect }: { pages: Page[]; current?: Page; onSelect: (id: string) => void }) {
  const chain = useMemo(() => {
    const result: Page[] = []
    let page = current
    const seen = new Set<string>()
    while (page && !seen.has(page.id)) {
      result.unshift(page)
      seen.add(page.id)
      page = page.parentId ? pages.find((item) => item.id === page?.parentId && !item.trashedAt) : undefined
    }
    return result
  }, [pages, current])

  if (!chain.length) return null

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden text-[11px] text-muted-foreground">
      {chain.map((page, index) => (
        <span key={page.id} className="flex min-w-0 items-center gap-1">
          <button onClick={() => onSelect(page.id)} className="max-w-[150px] truncate rounded-[5px] px-1 py-1 transition-colors hover:bg-accent hover:text-accent-foreground">
            {page.title || 'Bez názvu'}
          </button>
          {index < chain.length - 1 && <span aria-hidden className="text-muted-foreground/35">/</span>}
        </span>
      ))}
    </div>
  )
}

function ToolbarButton({ label, children, onClick, disabled = false, mobile = false }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean; mobile?: boolean }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={disabled} onClick={onClick} aria-label={label} className={`${mobile ? 'md:hidden' : ''} size-9 rounded-[7px] text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30`}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function Workspace({ initialPageId }: { initialPageId?: string } = {}) {
  const pages = useNupooStore((state) => state.pages)
  const trash = useNupooStore((state) => state.trash)
  const activePageId = useNupooStore((state) => state.activePageId)
  const sidebarOpen = useNupooStore((state) => state.sidebarOpen)
  const focusMode = useNupooStore((state) => state.focusMode)
  const dark = useNupooStore((state) => state.dark)
  const searchOpen = useNupooStore((state) => state.searchOpen)
  const query = useNupooStore((state) => state.query)
  const saveState = useNupooStore((state) => state.saveState)
  const hydrated = useNupooStore((state) => state.hydrated)
  const canUndo = useNupooStore((state) => state.canUndo)
  const canRedo = useNupooStore((state) => state.canRedo)
  const initialize = useNupooStore((state) => state.initialize)
  const selectPage = useNupooStore((state) => state.selectPage)
  const createPage = useNupooStore((state) => state.createPage)
  const updatePage = useNupooStore((state) => state.updatePage)
  const deletePage = useNupooStore((state) => state.deletePage)
  const restorePage = useNupooStore((state) => state.restorePage)
  const permanentlyDeletePage = useNupooStore((state) => state.permanentlyDeletePage)
  const emptyTrash = useNupooStore((state) => state.emptyTrash)
  const replaceWorkspace = useNupooStore((state) => state.replaceWorkspace)
  const undo = useNupooStore((state) => state.undo)
  const redo = useNupooStore((state) => state.redo)
  const toggleFavorite = useNupooStore((state) => state.toggleFavorite)
  const setSidebarOpen = useNupooStore((state) => state.setSidebarOpen)
  const toggleFocusMode = useNupooStore((state) => state.toggleFocusMode)
  const toggleDark = useNupooStore((state) => state.toggleDark)
  const setSearchOpen = useNupooStore((state) => state.setSearchOpen)
  const setQuery = useNupooStore((state) => state.setQuery)
  const setSaveState = useNupooStore((state) => state.setSaveState)

  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [trashOpen, setTrashOpen] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pathId = window.location.pathname.startsWith('/page/') ? decodeURIComponent(window.location.pathname.slice(6)) : ''
    initialize(initialPageId || params.get('page') || pathId || undefined)
  }, [initialPageId, initialize])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    try { window.localStorage.setItem('nupoo.theme', dark ? 'dark' : 'light') } catch { /* keep UI usable */ }
  }, [dark])

  useEffect(() => {
    if (!hydrated) return
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      dataService.save(pages)
      dataService.saveTrash(trash)
      setSaveState('saved')
    }, 450)
    return () => window.clearTimeout(timer)
  }, [pages, trash, hydrated, setSaveState])

  useEffect(() => {
    if (!hydrated || !activePageId) return
    const url = new URL(window.location.href)
    url.searchParams.set('page', activePageId)
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
  }, [activePageId, hydrated])

  const handleCreate = (parentId: string | null = null) => {
    const id = createPage(parentId)
    selectPage(id)
    setMobileSidebar(false)
  }

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) }
      else if (mod && event.key.toLowerCase() === 'n') { event.preventDefault(); const id = createPage(null); selectPage(id); setMobileSidebar(false) }
      else if (mod && event.key.toLowerCase() === 'z' && !event.shiftKey) { event.preventDefault(); undo() }
      else if ((mod && event.key.toLowerCase() === 'y') || (mod && event.shiftKey && event.key.toLowerCase() === 'z')) { event.preventDefault(); redo() }
      else if (mod && event.shiftKey && event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFocusMode() }
      else if (event.key === 'Escape') { setSearchOpen(false); setTrashOpen(false); setMobileSidebar(false) }
    }
    window.addEventListener('keydown', keyboard)
    return () => window.removeEventListener('keydown', keyboard)
  }, [createPage, redo, selectPage, setSearchOpen, toggleFocusMode, undo])

  const current = pages.find((page) => page.id === activePageId)
  const recent = useMemo(() => [...pages].filter((page) => !page.trashedAt && page.id !== activePageId).sort((a, b) => (b.lastOpenedAt || b.updatedAt).localeCompare(a.lastOpenedAt || a.updatedAt)).slice(0, 5), [pages, activePageId])

  const navigate = (id: string) => {
    selectPage(id)
    setMobileSidebar(false)
  }

  const importWorkspace = async (file: File) => {
    try {
      const parsed = parseImport(await file.text())
      if (!parsed || parsed.pages.length === 0) return
      replaceWorkspace(parsed.pages, parsed.trash, parsed.pages[0]?.id)
      setSaveState('saved')
    } catch { setSaveState('saving') }
  }

  if (!hydrated) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Načítání…</div>

  return (
    <div className={`min-h-screen bg-background text-foreground ${focusMode ? 'focus-mode' : ''}`}>
      <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importWorkspace(file); event.target.value = '' }} />

      <div className="flex min-h-screen">
        {!focusMode && sidebarOpen && <Sidebar pages={pages} trashCount={trash.length} recent={recent} activePageId={activePageId} dark={dark} onSelect={navigate} onCreate={handleCreate} onSearch={() => setSearchOpen(true)} onFavorite={toggleFavorite} onTrash={() => setTrashOpen(true)} onExport={() => downloadExport(pages, trash)} onImport={() => importRef.current?.click()} onToggleTheme={toggleDark} onToggleOpen={() => setSidebarOpen(false)} />}

        <AnimatePresence>{!focusMode && mobileSidebar && <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/35 md:hidden" onMouseDown={() => setMobileSidebar(false)} />
          <Sidebar mobile pages={pages} trashCount={trash.length} recent={recent} activePageId={activePageId} dark={dark} onSelect={navigate} onCreate={handleCreate} onSearch={() => setSearchOpen(true)} onFavorite={toggleFavorite} onTrash={() => setTrashOpen(true)} onExport={() => downloadExport(pages, trash)} onImport={() => importRef.current?.click()} onToggleTheme={toggleDark} onToggleOpen={() => setMobileSidebar(false)} onCloseMobile={() => setMobileSidebar(false)} />
        </>}</AnimatePresence>

        <main className="min-w-0 flex-1">
          {!focusMode && (
            <header className="sticky top-0 z-30 flex h-11 items-center gap-1 border-b border-border bg-background/94 px-2 backdrop-blur-md sm:px-3">
              <ToolbarButton label="Otevřít navigaci" mobile onClick={() => setMobileSidebar(true)}><PanelLeft size={16} /></ToolbarButton>
              <ToolbarButton label={sidebarOpen ? 'Skrýt navigaci' : 'Zobrazit navigaci'} onClick={() => setSidebarOpen(!sidebarOpen)}><PanelLeft size={16} /></ToolbarButton>
              <Breadcrumbs pages={pages} current={current} onSelect={navigate} />
              <div className="flex-1" />
              <div className="hidden items-center gap-0.5 sm:flex">
                <ToolbarButton label="Zpět" disabled={!canUndo} onClick={undo}><Undo2 size={15} /></ToolbarButton>
                <ToolbarButton label="Znovu" disabled={!canRedo} onClick={redo}><Redo2 size={15} /></ToolbarButton>
              </div>
              <div className="hidden items-center gap-1 px-1 text-[10px] font-medium text-muted-foreground/70 lg:flex">
                {saveState === 'saving' && <><Loader2 size={11} className="animate-spin" /> Ukládám</>}
                {saveState === 'saved' && <><Check size={11} /> Uloženo</>}
              </div>
              <ToolbarButton label="Hledat" onClick={() => setSearchOpen(true)}><Search size={16} /></ToolbarButton>
              <ToolbarButton label="Focus mode" onClick={toggleFocusMode}><Focus size={15} /></ToolbarButton>
              <ToolbarButton label={dark ? 'Světlý režim' : 'Tmavý režim'} onClick={toggleDark}>{dark ? <Sun size={16} /> : <Moon size={16} />}</ToolbarButton>
              {current && current.id !== 'welcome' && <ToolbarButton label="Přesunout stránku do koše" onClick={() => deletePage(current.id)}><Trash2 size={15} /></ToolbarButton>}
            </header>
          )}

          <motion.section key={activePageId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .12, ease: 'easeOut' }} className="mx-auto w-full max-w-[880px] px-4 pb-28 pt-6 sm:px-7 sm:pt-8 lg:px-9">
            {current ? <Editor page={current} onChange={updatePage} /> : <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Vyberte stránku.</div>}
          </motion.section>
        </main>
      </div>

      {searchOpen && <CommandPalette pages={pages} query={query} dark={dark} canUndo={canUndo} canRedo={canRedo} onQuery={setQuery} onClose={() => setSearchOpen(false)} onSelect={navigate} onCreate={() => handleCreate(null)} onToggleFavorite={() => current && toggleFavorite(current.id)} onTrash={() => setTrashOpen(true)} onUndo={undo} onRedo={redo} onToggleFocus={toggleFocusMode} onToggleTheme={toggleDark} />}
      {trashOpen && <TrashDialog trash={trash} onRestore={restorePage} onDelete={permanentlyDeletePage} onEmpty={emptyTrash} onClose={() => setTrashOpen(false)} />}
    </div>
  )
}

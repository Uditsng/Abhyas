'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import MenuBar from "@/components/text-editor/MenuBar"


export default function TipTapTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    editorProps:{
        attributes:{
            class: "min-h-[150px] border rounded-md bg-slate-50 py-2 px-3",
        },
    },
     content: value,
    onUpdate: ({ editor }) => {
      // This will call the onChange prop with the latest HTML content
    onChange(editor.getHTML());
    },
  })

  // Keep editor content in sync with parent if needed
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
    // eslint-disable-next-line
  }, [value])

  if (!editor) return null

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="border rounded border-gray-500 min-h-[120px] p-2" />
    </div>
  )
}

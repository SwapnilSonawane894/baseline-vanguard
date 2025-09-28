<script>
  import { onMount, onDestroy } from 'svelte';
  import { EditorView, minimalSetup } from 'codemirror';
  import { javascript } from '@codemirror/lang-javascript';
  import { css } from '@codemirror/lang-css';
  import { EditorState } from '@codemirror/state';
  
  export let value = '';
  export let language = 'javascript';
  export let readonly = false;
  
  let container;
  let view;
  let copySuccess = false;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(value);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  onMount(() => {
    const extensions = [
      minimalSetup,
      language === 'javascript' ? javascript() : css(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !readonly) {
          value = update.state.doc.toString();
        }
      }),
      EditorView.editable.of(!readonly),
      EditorView.theme({
        '&': {
          height: '400px',
          width: '100%',
        },
        '.cm-content': {
          padding: '12px',
          fontSize: '14px',
          fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
          lineHeight: '1.5',
          minHeight: '400px',
          minWidth: 'max-content',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          height: '100%',
          width: '100%',
        },
        '.cm-scroller': {
          fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
          overflowX: 'auto',
          overflowY: 'auto',
        },
        '.cm-line': {
          whiteSpace: 'pre',
        }
      })
    ];

    if (readonly) {
      extensions.push(EditorView.theme({
        '.cm-content': {
          backgroundColor: '#f7fafc',
          color: '#2d3748',
        }
      }));
    }

    const state = EditorState.create({
      doc: value,
      extensions
    });

    view = new EditorView({
      state,
      parent: container,
    });

    return () => {
      if (view) {
        view.destroy();
      }
    };
  });

  onDestroy(() => {
    if (view) {
      view.destroy();
    }
  });

  // Update editor content when value prop changes
  $: if (view && value !== view.state.doc.toString()) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value
      }
    });
  }
</script>

<div class="editor-container">
  <div bind:this={container} class="editor-wrapper"></div>
  {#if readonly && value.trim()}
    <button 
      class="copy-button" 
      on:click={copyToClipboard}
      title="Copy to clipboard"
    >
      {copySuccess ? '✓ Copied!' : '📋 Copy'}
    </button>
  {/if}
</div>

<style>
  .editor-container {
    position: relative;
    width: 100%;
  }

  .editor-wrapper {
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    overflow: auto;
    transition: border-color 0.3s ease;
    width: 100%;
    box-sizing: border-box;
  }
  
  .editor-wrapper:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .copy-button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(102, 126, 234, 0.9);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    z-index: 10;
  }

  .copy-button:hover {
    background: rgba(102, 126, 234, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }

  .copy-button:active {
    transform: translateY(0);
  }

  /* --- WINNING UI FIX --- */
  /* This targets the inner scrollable container of CodeMirror to add horizontal scrolling */
  :global(.cm-scroller) {
    overflow-x: auto;
  }

  :global(.cm-editor) {
    height: 400px;
  }
  
  :global(.cm-editor.cm-focused) {
    outline: none;
  }
</style>
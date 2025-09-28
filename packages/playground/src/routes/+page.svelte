<script>
  import { onMount } from 'svelte';
  import CodeEditor from '$lib/CodeEditor.svelte';
  let CodeMirror;

  let jsInputCode = `// Paste your JS code here!
import moment from 'moment';

const items = [1, 2, 3, 4];
const last = items.at(-1);

if (items.hasOwnProperty('length')) {
  console.log('Array has length');
}`;

  let cssInputCode = `/* Paste your CSS code here! */

article:has(.featured) {
  padding: 1rem;
}

@container (min-width: 400px) {
  .card {
    font-size: 1.2rem;
  }
}`;
  
  let jsOutputCode = 'Your fixed JavaScript will appear here.';
  let cssOutputCode = 'Your fixed CSS will appear here.';
  let jsMessages = [];
  let cssMessages = [];

  let activeTab = 'javascript';
  let loading = false;

  onMount(async () => {
    try {
      CodeMirror = (await import('codemirror')).default;
    } catch (e) {
      console.log('CodeMirror not loaded, using textarea fallback');
    }
  });

  async function lintAndFix(language) {
    loading = true;
    const inputCode = language === 'javascript' ? jsInputCode : cssInputCode;
    
    try {
      const response = await fetch('/api/lint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode, language }),
      });
      
      const result = await response.json();
      console.log(`[Frontend] API Response:`, result);

      if (response.ok) {
        if (language === 'javascript') {
          jsOutputCode = result.fixedCode;
          jsMessages = result.messages || [];
          console.log(`[Frontend] JS Messages:`, jsMessages);
        } else {
          cssOutputCode = result.fixedCode;
          cssMessages = result.messages || [];
          console.log(`[Frontend] CSS Messages:`, cssMessages);
        }
      } else {
        console.error('API Error:', result.error);
        if (language === 'javascript') {
          jsOutputCode = `Error: ${result.error}`;
          jsMessages = [];
        } else {
          cssOutputCode = `Error: ${result.error}`;
          cssMessages = [];
        }
      }
    } catch (error) {
      console.error('Network Error:', error);
      if (language === 'javascript') {
        jsOutputCode = `Network Error: ${error.message}`;
        jsMessages = [];
      } else {
        cssOutputCode = `Network Error: ${error.message}`;
        cssMessages = [];
      }
    }
    
    loading = false;
  }
</script>

<svelte:head>
  <title>🛡️ Baseline Vanguard Playground</title>
  <meta name="description" content="The intelligent co-pilot for the modern web. Write modern code, get production-ready results." />
</svelte:head>

<main>
  <header>
    <h1>🛡️ Baseline Vanguard Playground</h1>
    <p>The intelligent co-pilot for the modern web. Write modern code, get production-ready results.</p>
  </header>
  
  <div class="tabs">
    <button 
      class:active={activeTab === 'javascript'} 
      on:click={() => activeTab = 'javascript'}
    >
      JavaScript
    </button>
    <button 
      class:active={activeTab === 'css'} 
      on:click={() => activeTab = 'css'}
    >
      CSS
    </button>
  </div>

  {#if activeTab === 'javascript'}
    <div class="playground">
      <div class="editor-section">
        <h3>Input JavaScript</h3>
        <CodeEditor bind:value={jsInputCode} language="javascript" />
      </div>
      
      <div class="controls">
        <button 
          on:click={() => lintAndFix('javascript')} 
          disabled={loading}
          class="lint-button"
        >
          {loading ? '🔄 Analyzing...' : '▶ Lint & Fix'}
        </button>
      </div>
      
      <div class="editor-section">
        <h3>Fixed JavaScript</h3>
        <CodeEditor bind:value={jsOutputCode} language="javascript" readonly={true} />
      </div>
    </div>
    
    <div class="messages">
      <h3>🔍 ESLint Issues Found:</h3>
      {#if jsMessages.length > 0}
        <ul>
          {#each jsMessages as msg}
            <li class="message-item {msg.severity === 1 ? 'warning' : 'error'}">
              <strong>[{msg.line}:{msg.column}]</strong> 
              {msg.message} 
              <span class="rule-id">({msg.ruleId})</span>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="no-issues">✅ No issues found! Your code looks great.</p>
      {/if}
    </div>
  {:else}
    <div class="playground">
      <div class="editor-section">
        <h3>Input CSS</h3>
          <CodeEditor
            bind:value={cssInputCode}
            language="css"
            placeholder="Enter your CSS code here..."
            rows={15}
          />
      </div>
      
      <div class="controls">
        <button 
          on:click={() => lintAndFix('css')} 
          disabled={loading}
          class="lint-button"
        >
          {loading ? '🔄 Analyzing...' : '▶ Lint & Fix'}
        </button>
      </div>
      
      <div class="editor-section">
        <h3>Fixed CSS</h3>
          <CodeEditor
            bind:value={cssOutputCode}
            language="css"
            placeholder="Fixed code will appear here..."
            rows={15}
            readonly={true}
          />
      </div>
    </div>
    
    <div class="messages">
      <h3>🎨 Stylelint Issues Found:</h3>
      {#if cssMessages.length > 0}
        <ul>
          {#each cssMessages as msg}
            <li class="message-item {msg.severity === 'warning' ? 'warning' : 'error'}">
              <strong>[{msg.line}:{msg.column}]</strong> 
              {msg.text} 
              <span class="rule-id">({msg.rule})</span>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="no-issues">✅ No issues found! Your CSS looks great.</p>
      {/if}
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    background: white;
    min-height: 100vh;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 3rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  header p {
    font-size: 1.2rem;
    color: #718096;
    margin: 0;
  }

  .tabs {
    display: flex;
    margin-bottom: 2rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .tabs button {
    background: none;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #718096;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 3px solid transparent;
  }

  .tabs button:hover {
    color: #4a5568;
    background-color: #f7fafc;
  }

  .tabs button.active {
    color: #667eea;
    border-bottom-color: #667eea;
    background-color: #edf2f7;
  }

  .playground {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .editor-section {
    min-width: 0; /* Allow shrinking */
    overflow: hidden; /* Prevent overflow */
  }

  /* Force single column on smaller screens */
  @media (max-width: 1400px) {
    .playground {
      display: grid;
      grid-template-columns: 1fr !important;
      gap: 1rem;
    }
    
    .controls {
      order: 2;
      margin: 1rem 0;
      justify-self: center;
    }
  }

  .editor-section h3 {
    color: #2d3748;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
  }



  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lint-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .lint-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .lint-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .messages {
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 1rem;
  }

  .messages h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #2d3748;
    font-size: 1.2rem;
  }

  .messages ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .message-item {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 6px;
    border-left: 4px solid;
  }

  .message-item.error {
    background: #fed7d7;
    border-left-color: #e53e3e;
    color: #c53030;
  }

  .message-item.warning {
    background: #fefcbf;
    border-left-color: #d69e2e;
    color: #b7791f;
  }

  .rule-id {
    font-family: monospace;
    font-size: 0.9em;
    opacity: 0.8;
  }

  .no-issues {
    color: #38a169;
    font-weight: 600;
    margin: 0;
    padding: 1rem;
    background: #c6f6d5;
    border-radius: 6px;
    border-left: 4px solid #38a169;
  }

  @media (max-width: 1200px) {
    .playground {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .controls {
      order: 2;
      margin: 1rem 0;
    }
    
    main {
      padding: 1rem;
      max-width: 100%;
      overflow-x: hidden;
    }
    
    h1 {
      font-size: 2rem;
    }
    
    .tabs {
      overflow-x: auto;
      white-space: nowrap;
    }
    
    .tabs button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }
  }

  @media (max-width: 768px) {
    main {
      padding: 0.5rem;
    }
    
    h1 {
      font-size: 1.5rem;
    }
    
    .tabs button {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
    
    .lint-button {
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
    }
  }
</style>

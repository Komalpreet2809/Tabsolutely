document.addEventListener('DOMContentLoaded', () => {
  // --- Clock and Date logic removed ---

  const greetings = [
    "Still alive. Nice!",
    "Back for more tabs?",
    "Your procrastination station awaits!",
    "Another day, another browser session!",
    "Let's pretend we're productive!",
    "Touch grass later!",
    "Loading motivation...",
    "Coffee first. Everything else second!",
    "What's the mission today?",
    "What are we building today?",
    "Ready to conquer the internet?",
    "Let's make something awesome!",
    "One click closer to greatness!",
    "Welcome back!",
    "Ready when you are!",
    "Let's get things done!",
    "Today's a good day to start!",
    "Everything you need, right here!"
  ];

  const greetingIndex = Math.floor(Math.random() * greetings.length);
  const randomGreeting = greetings[greetingIndex];
  const greetingEl = document.getElementById('greeting-text');
  if (greetingEl) {
    greetingEl.textContent = randomGreeting;
  }

  // --- Map Animations 1-6 across the greetings ---
  const validAnims = [1, 2, 5, 6, 8, 9];
  
  // Tie the animation strictly to the greeting index!
  // Greeting 0 gets validAnims[0], Greeting 1 gets validAnims[1], Greeting 6 gets validAnims[0]
  const currentAnimNum = validAnims[greetingIndex % validAnims.length];
  const randomAnimNum = currentAnimNum; 
  
  const lottieContainer = document.getElementById('lottie-container');
  if (lottieContainer) {
    // Clear container completely
    lottieContainer.innerHTML = '';
    
    // Custom scale adjustments to make all animations look the same size
    // Change these numbers! > 1 makes them bigger, < 1 makes them smaller.
    const scaleAdjustments = {
      1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0,
      6: 1.0, 7: 1.0, 8: 1.0, 9: 1.0, 10: 1.0
    };
    
    // Create new player safely
    const player = document.createElement('lottie-player');
    
    // Add the CSS class we just created in styles.css to avoid CSP inline-style blocks
    player.classList.add('greeting-lottie-player');
    
    try {
      const scale = scaleAdjustments[randomAnimNum] || 1.0;
      player.style.transform = `scale(${scale})`;
      
      player.setAttribute('src', `anim${randomAnimNum}.json`);
      player.setAttribute('background', 'transparent');
      player.setAttribute('speed', '1');
      player.setAttribute('loop', '');
      player.setAttribute('autoplay', '');
      
      lottieContainer.appendChild(player);
    } catch (e) {
      greetingEl.textContent = "ERROR: " + e.message;
    }
  }

  // --- Search Bar ---
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        if (query.startsWith('http://') || query.startsWith('https://')) {
          window.open(query, '_blank');
        } else if (query.includes('.') && !query.includes(' ')) {
           window.open('https://' + query, '_blank');
        } else {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        }
      }
    }
  });

  // --- Pomodoro Timer ---
  let pomodoroInterval;
  let timeLeft = 25 * 60; // 25 minutes
  let isRunning = false;
  
  const timeDisplay = document.getElementById('pomodoro-time');

  // --- Dynamic Quick Access ---
  const defaultQuickLinks = [
    { name: 'Gmail', url: 'https://mail.google.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg' },
    { name: 'Calendar', url: 'https://calendar.google.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg' },
    { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg' },
    { name: 'Notion', url: 'https://notion.so', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png' },
    { name: 'Drive', url: 'https://drive.google.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { name: 'GitHub', url: 'https://github.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' }
  ];

  function getQuickLinks() {
    const saved = localStorage.getItem('tabsolutely_quick_links');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('tabsolutely_quick_links', JSON.stringify(defaultQuickLinks));
    return defaultQuickLinks;
  }

  function saveQuickLinks(links) {
    localStorage.setItem('tabsolutely_quick_links', JSON.stringify(links));
  }

  let draggedQuickLinkIndex = null;

  function renderQuickLinks() {
    const grid = document.getElementById('quick-access-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    const links = getQuickLinks();
    
    links.forEach((link, index) => {
      const tile = document.createElement('a');
      tile.href = link.url;
      tile.target = '_blank';
      tile.className = 'qa-item glass-panel';
      tile.setAttribute('draggable', 'true');
      
      // Drag and Drop Listeners for Quick Links
      tile.addEventListener('dragstart', (e) => {
        draggedQuickLinkIndex = index;
        setTimeout(() => tile.classList.add('dragging-tile'), 0);
      });
      
      tile.addEventListener('dragend', () => {
        tile.classList.remove('dragging-tile');
        draggedQuickLinkIndex = null;
      });
      
      tile.addEventListener('dragover', (e) => {
        e.preventDefault();
        tile.classList.add('drag-over-tile');
      });
      
      tile.addEventListener('dragleave', () => {
        tile.classList.remove('drag-over-tile');
      });
      
      tile.addEventListener('drop', (e) => {
        e.preventDefault();
        tile.classList.remove('drag-over-tile');
        
        if (draggedQuickLinkIndex === null || draggedQuickLinkIndex === index) return;
        
        const newLinks = [...links];
        const draggedItem = newLinks[draggedQuickLinkIndex];
        newLinks.splice(draggedQuickLinkIndex, 1);
        newLinks.splice(index, 0, draggedItem);
        
        saveQuickLinks(newLinks);
        renderQuickLinks();
      });

      // Icon
      const img = document.createElement('img');
      img.src = link.icon;
      img.alt = link.name;
      img.onerror = () => { img.src = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Blank_portrait.svg'; };
      
      // Name
      const span = document.createElement('span');
      span.textContent = link.name;
      
      // Remove Button
      const removeBtn = document.createElement('div');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '&times;'; // Cross icon
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent navigating to the link
        e.stopPropagation(); // Stop drag if clicking remove
        const newLinks = [...links];
        newLinks.splice(index, 1);
        saveQuickLinks(newLinks);
        renderQuickLinks();
      });
      
      tile.appendChild(img);
      tile.appendChild(span);
      tile.appendChild(removeBtn);
      grid.appendChild(tile);
    });
    
    // Add Button Tile if less than 8
    if (links.length < 8) {
      const addTile = document.createElement('div');
      addTile.className = 'qa-item qa-add-btn';
      
      const icon = document.createElement('span');
      icon.className = 'material-symbols-rounded qa-add-icon';
      icon.textContent = 'add';
      
      const text = document.createElement('span');
      text.textContent = 'Add';
      
      addTile.appendChild(icon);
      addTile.appendChild(text);
      
      addTile.addEventListener('click', () => {
        const modal = document.getElementById('quick-access-modal');
        const urlInput = document.getElementById('qa-url-input');
        const nameInput = document.getElementById('qa-name-input');
        const cancelBtn = document.getElementById('qa-cancel-btn');
        const saveBtn = document.getElementById('qa-save-btn');
        
        if (!modal) return;
        
        urlInput.value = '';
        nameInput.value = '';
        modal.style.display = 'flex';
        urlInput.focus();
        
        cancelBtn.onclick = () => {
          modal.style.display = 'none';
        };
        
        saveBtn.onclick = () => {
          const url = urlInput.value.trim();
          if (!url) return;
          
          let formattedUrl = url;
          if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = 'https://' + formattedUrl;
          }
          
          let defaultName = formattedUrl.replace('https://', '').replace('http://', '').replace('www.', '').split('.')[0];
          defaultName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
          
          const name = nameInput.value.trim() || defaultName;
          
          // Try to get a favicon from Google's service
          const iconUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${formattedUrl}&sz=64`;
          
          const newLinks = [...links, { name: name, url: formattedUrl, icon: iconUrl }];
          saveQuickLinks(newLinks);
          renderQuickLinks();
          modal.style.display = 'none';
        };
      });
      
      grid.appendChild(addTile);
    }
  }
  
  // Initial render
  renderQuickLinks();
  
  // Custom Pomodoro Time
  // Custom Pomodoro Time
  const timerView = document.getElementById('pomodoro-timer-view');
  const setView = document.getElementById('pomodoro-set-view');
  
  const inputHr = document.getElementById('pomodoro-input-hr');
  const inputMin = document.getElementById('pomodoro-input-min');
  const inputSec = document.getElementById('pomodoro-input-sec');
  
  const startBtn = document.getElementById('pomodoro-start-btn');
  const pauseBtn = document.getElementById('pomodoro-pause-btn');
  const cancelBtn = document.getElementById('pomodoro-cancel-btn');
  
  [inputHr, inputMin, inputSec].forEach(input => {
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          startBtn.click();
        }
      });
    }
  });
  
  const progressCircle = document.querySelector('.progress-circle');

  let totalDuration = 25 * 60;

  startBtn.addEventListener('click', () => {
    const hrs = parseInt(inputHr.value) || 0;
    const mins = parseInt(inputMin.value) || 0;
    const secs = parseInt(inputSec.value) || 0;
    timeLeft = (hrs * 3600) + (mins * 60) + secs;
    totalDuration = timeLeft > 0 ? timeLeft : 1; // Prevent div by zero
    
    updatePomodoroDisplay();
    setView.style.display = 'none';
    timerView.style.display = 'flex';
    
    if (!isRunning) togglePomodoro();
  });

  pauseBtn.addEventListener('click', () => {
    togglePomodoro();
  });

  cancelBtn.addEventListener('click', () => {
    if (isRunning) {
      clearInterval(pomodoroInterval);
      isRunning = false;
    }
    pauseBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 24px;">pause</span>';
    
    // Switch back to set view
    timerView.style.display = 'none';
    setView.style.display = 'flex';
    inputHr.value = '';
    inputMin.value = '';
    inputSec.value = '';
  });

  timeDisplay.style.cursor = 'default';
  timeDisplay.title = "";
  
  function updatePomodoroDisplay() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    let timeString = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    if (hours > 0) {
      timeString = `${hours}:${timeString}`;
    }
    timeDisplay.textContent = timeString;
    
    const progress = (timeLeft / totalDuration);
    progressCircle.style.strokeDashoffset = 283 - (progress * 283);
  }
  
  function togglePomodoro() {
    if (isRunning) {
      clearInterval(pomodoroInterval);
      pauseBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 24px;">play_arrow</span>';
      isRunning = false;
    } else {
      isRunning = true;
      pauseBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 24px;">pause</span>';
      pomodoroInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updatePomodoroDisplay();
        } else {
          clearInterval(pomodoroInterval);
          isRunning = false;
          pauseBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 24px;">pause</span>';
          
          // Go back to set view when done
          timerView.style.display = 'none';
          setView.style.display = 'flex';
          inputHr.value = '';
          inputMin.value = '';
          inputSec.value = '';
          
          // Show custom modal instead of alert
          const modal = document.getElementById('custom-alert-modal');
          const closeBtn = document.getElementById('close-alert-btn');
          if (modal && closeBtn) {
            modal.style.display = 'flex';
            closeBtn.onclick = () => {
              modal.style.display = 'none';
            };
          }
        }
      }, 1000);
    }
  }
  
  updatePomodoroDisplay();

  // --- Real-Time Bookmarks (Requires 'bookmarks' permission) ---
  const bookmarksList = document.getElementById('bookmarks-list');
  if (chrome && chrome.bookmarks) {
    chrome.bookmarks.getRecent(5, (bookmarks) => {
      bookmarksList.innerHTML = '';
      if (bookmarks.length === 0) {
        bookmarksList.innerHTML = '<li><div class="list-item-content">No bookmarks yet.</div></li>';
      }
      const colors = ['folder-blue', 'folder-purple', 'folder-cyan', 'folder-green', 'folder-red'];
      bookmarks.forEach((bm, i) => {
        const color = colors[i % colors.length];
        const li = document.createElement('li');
        li.innerHTML = `<div class="list-item-content" style="cursor: pointer;" onclick="window.open('${bm.url}', '_blank')">
                          <span class="color-dot ${color}"></span> 
                          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${bm.title}</span>
                        </div>`;
        bookmarksList.appendChild(li);
      });
    });
  }

  // --- Real-Time History (Requires 'history' permission) ---
  const historyList = document.getElementById('history-list');
  if (chrome && chrome.history) {
    chrome.history.search({ text: '', maxResults: 5 }, (results) => {
      historyList.innerHTML = '';
      if (results.length === 0) {
        historyList.innerHTML = '<li><div class="list-item-content">No history found.</div></li>';
      }
      results.forEach(page => {
        const urlObj = new URL(page.url);
        const domain = urlObj.hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        
        const li = document.createElement('li');
        li.innerHTML = `<div class="list-item-content" style="cursor: pointer;" onclick="window.open('${page.url}', '_blank')">
                          <img src="${faviconUrl}" alt="icon" class="list-icon"> 
                          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;">${page.title || domain}</span>
                        </div>
                        <span class="time-ago">${page.visitCount} visits</span>`;
        historyList.appendChild(li);
      });
    });
  }

  // --- Dynamic User Profile ---
  function updateProfileWithInitial(email) {
    let namePart = email.split('@')[0];
    namePart = namePart.split('.')[0];
    const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    document.getElementById('user-name').textContent = firstName;
    
    const avatarUrl = `https://ui-avatars.com/api/?name=${firstName}&background=222&color=fff`;
    document.getElementById('user-avatar').src = avatarUrl;
  }

  function loadGoogleProfile(interactive) {
    if (!chrome || !chrome.identity) return;
    
    // Fall back to basic profile info instantly
    chrome.identity.getProfileUserInfo({accountStatus: 'ANY'}, function(userInfo) {
      if (userInfo && userInfo.email) {
        updateProfileWithInitial(userInfo.email);
      }
    });

    // Attempt OAuth to get the real profile picture
    chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
      if (chrome.runtime.lastError || !token) {
        console.log("OAuth silent auth failed. User can click profile to connect.", chrome.runtime.lastError);
        return;
      }
      
      // Fetch high-res profile data
      fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token)
        .then(response => response.json())
        .then(data => {
          if (data.picture) {
            document.getElementById('user-avatar').src = data.picture;
          }
          if (data.given_name) {
            document.getElementById('user-name').textContent = data.name || data.given_name;
          }
        })
        .catch(err => console.error("Error fetching Google profile", err));
    });
  }

  // Attempt silent auth on load
  loadGoogleProfile(false);

  // If user clicks the profile, trigger interactive auth popup
  const userProfileEl = document.querySelector('.user-profile');
  if (userProfileEl) {
    userProfileEl.addEventListener('click', () => {
      loadGoogleProfile(true);
    });
  }

  // --- Storage Based Todos (Requires 'storage' permission) ---
  const todoListEl = document.getElementById('todo-list');
  const addTodoBtn = document.getElementById('add-todo-btn');
  const todoInputContainer = document.getElementById('todo-input-container');
  const newTodoInput = document.getElementById('new-todo-input');
  
  let draggedTodoIndex = null;
  let isTickedOpen = false; // State for accordion

  function renderTodos(todos) {
    todoListEl.innerHTML = '';
    
    const activeTodos = [];
    const completedTodos = [];
    
    // Split todos while keeping their original index for data mapping
    todos.forEach((todo, idx) => {
      if (todo.checked) {
        completedTodos.push({ ...todo, originalIndex: idx });
      } else {
        activeTodos.push({ ...todo, originalIndex: idx });
      }
    });

    if (todos.length === 0) {
      todoListEl.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-secondary);">No tasks for today. Click + to add.</div>';
      return;
    }

    // Render Active Todos
    activeTodos.forEach((todo) => {
      const idx = todo.originalIndex;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'todo-item';
      itemDiv.setAttribute('draggable', 'true');
      itemDiv.setAttribute('data-index', idx);
      
      itemDiv.innerHTML = `
        <span class="material-symbols-rounded drag-handle">drag_indicator</span>
        <label style="display:flex; align-items:center; gap:12px; cursor:pointer; flex:1;">
          <input type="checkbox" data-index="${idx}">
          <span class="checkmark material-symbols-rounded"></span>
          <span class="todo-text">${todo.text}</span>
        </label>
        <button class="delete-todo icon-btn-small" data-index="${idx}" style="margin-left:auto;"><span class="material-symbols-rounded" style="font-size: 16px;">close</span></button>
      `;
      
      // Drag-and-Drop Listeners
      itemDiv.addEventListener('dragstart', (e) => {
        draggedTodoIndex = idx;
        setTimeout(() => itemDiv.classList.add('dragging'), 0);
      });
      
      itemDiv.addEventListener('dragend', () => {
        itemDiv.classList.remove('dragging');
        draggedTodoIndex = null;
      });
      
      itemDiv.addEventListener('dragover', (e) => {
        e.preventDefault();
        itemDiv.classList.add('drag-over');
      });
      
      itemDiv.addEventListener('dragleave', () => {
        itemDiv.classList.remove('drag-over');
      });
      
      itemDiv.addEventListener('drop', (e) => {
        e.preventDefault();
        itemDiv.classList.remove('drag-over');
        if (draggedTodoIndex === null || draggedTodoIndex === idx) return;
        
        // Reorder
        const draggedItem = todos[draggedTodoIndex];
        todos.splice(draggedTodoIndex, 1);
        todos.splice(idx, 0, draggedItem);
        
        saveTodos(todos);
        renderTodos(todos);
      });
      
      todoListEl.appendChild(itemDiv);
    });

    // Render Completed Todos Accordion if any exist
    if (completedTodos.length > 0) {
      const separator = document.createElement('hr');
      separator.className = 'ticked-separator';
      todoListEl.appendChild(separator);

      const header = document.createElement('div');
      header.className = `ticked-accordion-header ${isTickedOpen ? 'open' : ''}`;
      header.innerHTML = `
        <span class="material-symbols-rounded chevron-icon">expand_more</span>
        <span>${completedTodos.length} ticked items</span>
      `;
      
      const tickedContainer = document.createElement('div');
      tickedContainer.className = `ticked-items-container ${isTickedOpen ? 'open' : ''}`;

      header.addEventListener('click', () => {
        isTickedOpen = !isTickedOpen;
        header.classList.toggle('open');
        tickedContainer.classList.toggle('open');
      });

      todoListEl.appendChild(header);
      
      completedTodos.forEach((todo) => {
        const idx = todo.originalIndex;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'todo-item checked';
        // Note: No draggable attribute and no drag handle for completed items!
        
        itemDiv.innerHTML = `
          <label style="display:flex; align-items:center; gap:12px; cursor:pointer; flex:1; margin-left: 24px;">
            <input type="checkbox" checked data-index="${idx}">
            <span class="checkmark material-symbols-rounded">check</span>
            <span class="todo-text">${todo.text}</span>
          </label>
          <button class="delete-todo icon-btn-small" data-index="${idx}" style="margin-left:auto;"><span class="material-symbols-rounded" style="font-size: 16px;">close</span></button>
        `;
        tickedContainer.appendChild(itemDiv);
      });

      todoListEl.appendChild(tickedContainer);
    }

    // Add listeners to all checkboxes
    todoListEl.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const idx = this.getAttribute('data-index');
        todos[idx].checked = this.checked;
        saveTodos(todos);
        renderTodos(todos); 
      });
    });

    // Add listeners to all delete buttons
    todoListEl.querySelectorAll('.delete-todo').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); 
        const idx = this.getAttribute('data-index');
        todos.splice(idx, 1);
        saveTodos(todos);
        renderTodos(todos);
      });
    });
  }

  function saveTodos(todos) {
    if (chrome && chrome.storage) {
      chrome.storage.local.set({ 'tabsolutely_todos': todos });
    }
  }

  if (chrome && chrome.storage) {
    chrome.storage.local.get(['tabsolutely_todos'], (result) => {
      const todos = result.tabsolutely_todos || [
        { text: "Finish Chrome Extension UI", checked: true },
        { text: "Review PR #42", checked: false }
      ];
      renderTodos(todos);
      
      const closeTodoInputBtn = document.getElementById('close-todo-input-btn');

      addTodoBtn.addEventListener('click', () => {
        todoInputContainer.style.display = todoInputContainer.style.display === 'none' ? 'block' : 'none';
        if (todoInputContainer.style.display === 'block') newTodoInput.focus();
      });

      if (closeTodoInputBtn) {
        closeTodoInputBtn.addEventListener('click', () => {
          todoInputContainer.style.display = 'none';
          newTodoInput.value = '';
        });
      }

      newTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const task = newTodoInput.value.trim();
          if (task) {
            todos.push({ text: task, checked: false });
            saveTodos(todos);
            renderTodos(todos);
            newTodoInput.value = '';
            todoInputContainer.style.display = 'none';
          }
        }
      });
    });
  }

  // --- Storage Based Simple Notepad (Requires 'storage' permission) ---
  const simpleNotepad = document.getElementById('simple-notepad');
  const copyNoteBtn = document.getElementById('copy-note-btn');
  const clearNoteBtn = document.getElementById('clear-note-btn');

  if (chrome && chrome.storage && simpleNotepad) {
    chrome.storage.local.get(['tabsolutely_simple_note'], (result) => {
      simpleNotepad.value = result.tabsolutely_simple_note || "";
      
      simpleNotepad.addEventListener('input', () => {
        chrome.storage.local.set({ 'tabsolutely_simple_note': simpleNotepad.value });
      });
      
      if (copyNoteBtn) {
        copyNoteBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(simpleNotepad.value).then(() => {
            const icon = copyNoteBtn.querySelector('span');
            icon.textContent = 'check';
            icon.style.color = '#22c55e'; // Green check
            setTimeout(() => {
              icon.textContent = 'content_copy';
              icon.style.color = '';
            }, 1500);
          });
        });
      }

      if (clearNoteBtn) {
        clearNoteBtn.addEventListener('click', () => {
          if (confirm("Are you sure you want to clear your notes?")) {
            simpleNotepad.value = '';
            chrome.storage.local.set({ 'tabsolutely_simple_note': '' });
          }
        });
      }
    });
  }
});









// --- Aesthetic Image Widget ---
const aestheticImageContainer = document.getElementById('aesthetic-image-container');
const aestheticImage = document.getElementById('aesthetic-image');

if (aestheticImageContainer && aestheticImage) {
  aestheticImageContainer.style.cursor = 'pointer';

  function changeImage() {
    aestheticImage.style.opacity = '0';
    setTimeout(() => {
      const randomSeed = Math.floor(Math.random() * 10000);
      aestheticImage.src = `https://picsum.photos/seed/tab${randomSeed}/400/300`;
      aestheticImage.onload = () => {
        aestheticImage.style.opacity = '0.9';
      };
    }, 500);
  }

  // Auto-change every 1 minute
  setInterval(changeImage, 60000);

  // Also change on click
  aestheticImageContainer.addEventListener('click', changeImage);
}


// --- Theme Toggle Widget ---
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

if (themeToggleBtn) {
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    themeIcon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
  });
}

function loadConversations() {
    var clientId = localStorage.getItem('wpaicg_chat_client_id');
    if (!clientId) {
        // Show conversation starters for each chat interface when there are no conversations
        showAllConversationStarters();
        return;
    }

    // Load conversations for both chat interfaces
    loadChatInterface('.wpaicg-chat-shortcode', 'shortcode', clientId);
    loadChatInterface('.wpaicg-chatbox', 'widget', clientId);
}

function showAllConversationStarters() {
    // Target both interfaces
    var containers = ['.wpaicg-chat-shortcode', '.wpaicg-chatbox'];
    containers.forEach(containerSelector => {
        var chatContainers = document.querySelectorAll(containerSelector);
        chatContainers.forEach(chatContainer => {
            showConversationStarters(chatContainer);
        });
    });
}

function loadChatInterface(containerSelector, type, clientId) {
    var chatContainers = document.querySelectorAll(containerSelector);

    chatContainers.forEach(chatContainer => {

        // Read autoload chat conversations setting, default to '0' if not set
        var autoloadConversations = chatContainer.getAttribute('data-autoload_chat_conversations');
        if (autoloadConversations === null) {
            autoloadConversations = '1';  // Default value if attribute does not exist
        }

        // Fetch the bot ID based on the type
        var botId = chatContainer.getAttribute('data-bot-id') || '0';

        // Determine the history key based on whether it's a custom bot or not
        var historyKey = botId !== '0' 
            ? `wpaicg_chat_history_custom_bot_${botId}_${clientId}` 
            : `wpaicg_chat_history_${type}_${clientId}`;

        if (autoloadConversations === '0') {
            // Retrieve and display the chat history
            var chatHistory = localStorage.getItem(historyKey);
            if (chatHistory) {
                chatHistory = JSON.parse(chatHistory);
                
                // Convert old format messages to new format
                chatHistory = chatHistory.map(message => {
                    if (typeof message === 'string') {
                        return {
                            id: '', // Old messages won't have an ID, so leave it empty
                            text: message
                        };
                    }
                    return message; // Leave new format messages as is
                });

                // Save the updated history back to localStorage in the new format
                localStorage.setItem(historyKey, JSON.stringify(chatHistory));

                var chatBox = chatContainer.querySelector('.wpaicg-chatbox-messages, .wpaicg-chat-shortcode-messages'); // Generalized selector
                if (!chatBox) {
                    console.error(`No chat box found within the ${type} container.`);
                    return;
                }
                chatBox.innerHTML = '';  // Clears the chat box
                chatHistory.forEach(message => {
                    reconstructMessage(chatBox, message, chatContainer);
                });
                chatBox.appendChild(document.createElement('br'));
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        chatBox.scrollTop = chatBox.scrollHeight; // Scrolls to the bottom
                    });
                });
                hideConversationStarter(chatContainer);

            } else {
                showConversationStarters(chatContainer);
            }
        } else {
            showConversationStarters(chatContainer);
        }
    });
}

function reconstructMessage(chatBox, message, chatContainer) {
    var messageElement = document.createElement('li');
    
    // Check if message is an object and has a 'text' property
    var messageText = typeof message === 'object' && message.text ? message.text : message;
    
    // Determine if the message is from the user or AI
    var isUserMessage = messageText.startsWith('Human:');
    var isWidget = chatContainer.classList.contains('wpaicg-chatbox');

    // Apply the correct class based on message source and container type
    if (isUserMessage) {
        messageElement.className = isWidget ? 'wpaicg-chat-user-message' : 'wpaicg-user-message';
    } else {
        messageElement.className = isWidget ? 'wpaicg-chat-ai-message' : 'wpaicg-ai-message';
    }
    
    // Format the message content
    var formattedMessage = messageText.replace('Human:', '').replace('AI:', '').replace(/\n/g, '<br>');
    var userBgColor = chatContainer.getAttribute('data-user-bg-color');
    var aiBgColor = chatContainer.getAttribute('data-ai-bg-color');
    var fontSize = chatContainer.getAttribute('data-fontsize');
    var fontColor = chatContainer.getAttribute('data-color');
    var useAvatar = parseInt(chatContainer.getAttribute('data-use-avatar')) || 0;
    var userAvatar = chatContainer.getAttribute('data-user-avatar');
    var aiAvatar = chatContainer.getAttribute('data-ai-avatar');
    var displayName = isUserMessage ? (useAvatar ? `<img src="${userAvatar}" height="40" width="40">` : 'You:') : (useAvatar ? `<img src="${aiAvatar}" height="40" width="40">` : 'AI:');

    messageElement.style.backgroundColor = isUserMessage ? userBgColor : aiBgColor;
    messageElement.style.color = fontColor;
    messageElement.style.fontSize = fontSize;
    messageElement.innerHTML = `<p style="width:100%"><strong class="wpaicg-chat-avatar">${displayName}</strong> <span class="wpaicg-chat-message">${formattedMessage}</span></p>`;

    chatBox.appendChild(messageElement);
}
function hideConversationStarter(chatContainer) {
    var starters = chatContainer.querySelectorAll('.wpaicg-conversation-starters');
    starters.forEach(starter => starter.style.display = 'none');
}

function showConversationStarters(chatContainer) {
    const startersContainer = chatContainer.querySelector('.wpaicg-conversation-starters');
    if (startersContainer) {  // Check if the container exists
        startersContainer.style.visibility = 'visible'; // Make the container visible if it exists
        const starters = startersContainer.querySelectorAll('.wpaicg-conversation-starter');
        starters.forEach((starter, index) => {
            setTimeout(() => {
                starter.style.opacity = "1";
                starter.style.transform = "translateY(0)";
            }, index * 150); // Staggered appearance
        });
    }
}
function wpaicgChatShortcodeSize() {
    var wpaicgWindowWidth = window.innerWidth;
    var wpaicgWindowHeight = window.innerHeight;
    var chatShortcodes = document.getElementsByClassName('wpaicg-chat-shortcode');

    if (chatShortcodes !== null && chatShortcodes.length) {
        for (var i = 0; i < chatShortcodes.length; i++) {
            var chatShortcode = chatShortcodes[i];
            var parentChat = chatShortcode.parentElement;
            var parentWidth = parentChat.offsetWidth;
            var chatWidth = chatShortcode.getAttribute('data-width');
            var chatHeight = chatShortcode.getAttribute('data-height');
            var chatFooter = chatShortcode.getAttribute('data-footer') === 'true';
            var chatBar = chatShortcode.getAttribute('data-has-bar');
            var chatRounded = parseFloat(chatShortcode.getAttribute('data-chat_rounded'));
            var textRounded = parseFloat(chatShortcode.getAttribute('data-text_rounded'));
            var textHeight = parseFloat(chatShortcode.getAttribute('data-text_height'));
            var textInput = chatShortcode.getElementsByClassName('wpaicg-chat-shortcode-typing')[0];

            textInput.style.height = textHeight + 'px';
            textInput.style.borderRadius = textRounded + 'px';
            chatShortcode.style.borderRadius = chatRounded + 'px';
            chatShortcode.style.overflow = 'hidden';
            chatWidth = chatWidth !== null ? chatWidth : '350';
            chatHeight = chatHeight !== null ? chatHeight : '400';

            if (chatShortcode.classList.contains('wpaicg-fullscreened')) {
                parentWidth = wpaicgWindowWidth;

                chatWidth = resolveDimension(chatWidth, parentWidth);
                chatHeight = resolveDimension(chatHeight, wpaicgWindowHeight);

                var chatPreviewBot = chatShortcode.closest('.wpaicg-bot-preview');
                if (chatPreviewBot && chatPreviewBot.offsetWidth < chatWidth) {
                    chatWidth = chatPreviewBot.offsetWidth;
                }

                chatShortcode.style.width = chatWidth + 'px';
                chatShortcode.style.maxWidth = chatWidth + 'px';
                chatShortcode.style.height = chatHeight + 'px';
                chatShortcode.style.maxHeight = chatHeight + 'px';
                chatShortcode.style.marginTop = 0;

                var deduceHeight = 69;
                if (chatFooter) {
                    deduceHeight += 60; // Adjusted for footer height
                }
                if (chatBar) {
                    deduceHeight += 30;
                }

                var chatMessages = chatShortcode.getElementsByClassName('wpaicg-chat-shortcode-messages')[0];
                chatMessages.style.height = (chatHeight - deduceHeight - textHeight) + 'px';

                // Scroll to the bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                // Original non-fullscreen logic
                if (chatWidth.indexOf('%') < 0) {
                    if (chatWidth.indexOf('px') < 0) {
                        chatWidth = parseFloat(chatWidth);
                    } else {
                        chatWidth = parseFloat(chatWidth.replace(/px/g, ''));
                    }
                } else {
                    chatWidth = parseFloat(chatWidth.replace(/%/g, ''));
                    if (chatWidth < 100) {
                        chatWidth = chatWidth * parentWidth / 100;
                    } else {
                        chatWidth = '';
                    }
                }

                if (chatHeight.indexOf('%') < 0) {
                    if (chatHeight.indexOf('px') < 0) {
                        chatHeight = parseFloat(chatHeight);
                    } else {
                        chatHeight = parseFloat(chatHeight.replace(/px/g, ''));
                    }
                } else {
                    chatHeight = parseFloat(chatHeight.replace(/%/g, ''));
                    chatHeight = chatHeight * wpaicgWindowHeight / 100;
                }

                if (chatWidth !== '') {
                    chatShortcode.style.width = chatWidth + 'px';
                    chatShortcode.style.maxWidth = chatWidth + 'px';
                } else {
                    chatShortcode.style.width = '';
                    chatShortcode.style.maxWidth = '';
                }

                if (chatShortcode.classList.contains('wpaicg-fullscreened')) {
                    chatShortcode.style.marginTop = 0;
                } else {
                    chatShortcode.style.marginTop = '';
                }

                var chatMessages = chatShortcode.getElementsByClassName('wpaicg-chat-shortcode-messages')[0];
                var deduceHeight = 69;
                if (chatFooter) {
                    deduceHeight += 60; // Adjusted for footer height
                }
                if (chatBar) {
                    deduceHeight += 30;
                }
                chatMessages.style.height = (chatHeight - deduceHeight) + 'px';
            }
        }
    }
}
function wpaicgChatBoxSize() {
    var wpaicgWindowWidth = window.innerWidth;
    var wpaicgWindowHeight = window.innerHeight;
    var chatWidgets = document.getElementsByClassName('wpaicg_chat_widget_content');
    var chatPreviewBox = document.getElementsByClassName('wpaicg-chatbox-preview-box');

    if (chatWidgets.length) {
        for (var i = 0; i < chatWidgets.length; i++) {
            var chatWidget = chatWidgets[i];
            var chatbox = chatWidget.getElementsByClassName('wpaicg-chatbox')[0];
            var chatWidth = chatbox.getAttribute('data-width') || '350';
            var chatHeight = chatbox.getAttribute('data-height') || '400';
            var chatFooter = chatbox.getAttribute('data-footer');
            var chatboxBar = chatbox.getElementsByClassName('wpaicg-chatbox-action-bar');
            var textHeight = parseFloat(chatbox.getAttribute('data-text_height'));

            // Adjust dimensions for the preview box if present
            if (chatPreviewBox.length && chatPreviewBox[0].offsetWidth) {
                wpaicgWindowWidth = chatPreviewBox[0].offsetWidth;
            }

            // Calculate dimensions dynamically
            chatWidth = resolveDimension(chatWidth, wpaicgWindowWidth);
            chatHeight = resolveDimension(chatHeight, wpaicgWindowHeight);

            chatbox.style.width = chatWidth + 'px';
            chatbox.style.height = chatHeight + 'px';
            chatWidget.style.width = chatWidth + 'px';
            chatWidget.style.height = chatHeight + 'px';

            if (chatPreviewBox.length) {
                chatPreviewBox[0].style.height = (chatHeight + 125) + 'px'; // Adjusting preview box height
            }

            // Adjusting heights for content and message areas
            var actionBarHeight = chatboxBar.length ? 40 : 0; // Assuming action bar height is 40
            var footerHeight = chatFooter ? 60 : 0; // Adjusting footer height if enabled
            var contentHeight = chatHeight - textHeight - actionBarHeight - footerHeight - 20; // Including some padding
            var messagesHeight = contentHeight - 20; // Additional space for inner padding or margins

            var chatboxContent = chatWidget.getElementsByClassName('wpaicg-chatbox-content')[0];
            var chatboxMessages = chatWidget.getElementsByClassName('wpaicg-chatbox-messages')[0];
            chatboxContent.style.height = contentHeight + 'px';
            chatboxMessages.style.height = messagesHeight + 'px';

            // Ensure last message is visible
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
        }
    }
}

function resolveDimension(value, totalSize) {
    if (value.includes('%')) {
        return parseFloat(value) / 100 * totalSize;
    } else if (value.includes('px')) {
        return parseFloat(value.replace('px', ''));
    }
    return parseFloat(value); // Default to parsing the value as pixels if no units are specified
}

function wpaicgChatInit() {
    let wpaicgMicIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M176 0C123 0 80 43 80 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM48 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H104c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H200V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"/></svg>';
    let wpaicgStopIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256-96a96 96 0 1 1 0 192 96 96 0 1 1 0-192zm0 224a128 128 0 1 0 0-256 128 128 0 1 0 0 256zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>';
    var wpaicgChatStream;
    var wpaicgChatRec;
    var wpaicgInput;
    var wpaicgChatAudioContext = window.AudioContext || window.webkitAudioContext;
    var wpaicgaudioContext;
    var wpaicgMicBtns = document.querySelectorAll('.wpaicg-mic-icon');
    var wpaicgChatTyping = document.querySelectorAll('.wpaicg-chatbox-typing');
    var wpaicgShortcodeTyping = document.querySelectorAll('.wpaicg-chat-shortcode-typing');
    var wpaicgChatSend = document.querySelectorAll('.wpaicg-chatbox-send');
    var wpaicgShortcodeSend = document.querySelectorAll('.wpaicg-chat-shortcode-send');
    var wpaicgChatFullScreens = document.getElementsByClassName('wpaicg-chatbox-fullscreen');
    var wpaicgChatCloseButtons = document.getElementsByClassName('wpaicg-chatbox-close-btn');
    var wpaicgChatDownloadButtons = document.getElementsByClassName('wpaicg-chatbox-download-btn');
    var wpaicg_chat_widget_toggles = document.getElementsByClassName('wpaicg_toggle');
    var wpaicg_chat_widgets = document.getElementsByClassName('wpaicg_chat_widget');
    var imageInputThumbnail = null; // Variable to store the image thumbnail
    function setupConversationStarters() {
        const starters = document.querySelectorAll('.wpaicg-conversation-starter');
        starters.forEach(starter => {
            starter.addEventListener('click', function() {
                const messageText = starter.innerText || starter.textContent;
                const chatContainer = starter.closest('.wpaicg-chat-shortcode') || starter.closest('.wpaicg-chatbox');
                const type = chatContainer.classList.contains('wpaicg-chat-shortcode') ? 'shortcode' : 'widget';
                const typingInput = type === 'shortcode' ? chatContainer.querySelector('.wpaicg-chat-shortcode-typing') : chatContainer.querySelector('.wpaicg-chatbox-typing');
    
                typingInput.value = messageText;
                wpaicgSendChatMessage(chatContainer, typingInput, type);
    
                // Hide all starters
                starters.forEach(starter => {
                    starter.style.display = 'none';
                });
            });
        });
    }
    
    setupConversationStarters();


    var imageIcon = document.querySelector('.wpaicg-img-icon');
    var spinner = document.querySelector('.wpaicg-img-spinner');
    var thumbnailPlaceholder = document.querySelector('.wpaicg-thumbnail-placeholder');

    if (imageIcon) {
        imageIcon.addEventListener('click', function() {
            var imageInput = document.getElementById('imageUpload');
            imageInput.click();
        });
    }

    var imageInput = document.getElementById('imageUpload');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                var file = this.files[0];  // Store the file reference here
    
                // Show the spinner and hide the image icon
                imageIcon.style.display = 'none';
                spinner.style.display = 'inline-block';
                
                imageIcon.title = file.name; // Optional: show image name on hover
    
                // Hide the spinner and show the image icon and thumbnail after a delay
                setTimeout(function() {
                    spinner.style.display = 'none';
                    imageIcon.style.display = 'inline-block'; // Re-display image icon
                    
                    // Now set the thumbnail image using the stored file reference
                    thumbnailPlaceholder.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
                    thumbnailPlaceholder.style.backgroundSize = 'cover';
                    thumbnailPlaceholder.style.backgroundPosition = 'center';
                    thumbnailPlaceholder.style.backgroundRepeat = 'no-repeat';
                    thumbnailPlaceholder.style.display = 'inline-block'; // Display thumbnail
                }, 2000);
            }
        });
    }
    
    // Function to set up event listeners on all clear chat buttons
    function setupClearChatButtons() {
        var wpaicgChatClearButtons = document.querySelectorAll('.wpaicg-chatbox-clear-btn');
        wpaicgChatClearButtons.forEach(button => {
            button.addEventListener('click', function() {
                var chatContainer = button.closest('[data-bot-id]'); // Finds the nearest parent with 'data-bot-id'
                if (chatContainer) {
                    var botId = chatContainer.getAttribute('data-bot-id') || '0';
                    var clientId = localStorage.getItem('wpaicg_chat_client_id');
                    clearChatHistory(botId, clientId, chatContainer);
                }
            });
        });
    }

    // Function to clear the chat history from local storage and the display
    function clearChatHistory(botId, clientId, chatContainer) {
        var isCustomBot = botId !== '0';
        var type = chatContainer.classList.contains('wpaicg-chat-shortcode') ? 'shortcode' : 'widget'; // Determine the type based on class
        var historyKey = isCustomBot 
            ? `wpaicg_chat_history_custom_bot_${botId}_${clientId}` 
            : `wpaicg_chat_history_${type}_${clientId}`; // Adjust history key based on type

        // Remove the item from local storage
        localStorage.removeItem(historyKey);

        // Clear the chat display
        var chatBoxSelector = '.wpaicg-chatbox-messages, .wpaicg-chat-shortcode-messages'; // Generalized selector for both types
        var chatBox = chatContainer.querySelector(chatBoxSelector);
        if (chatBox) {
            chatBox.innerHTML = ''; // Clear the chat box visually
        }
    }

    // Call this function once your DOM is fully loaded or at the end of your script
    setupClearChatButtons();


    if(wpaicg_chat_widget_toggles !== null && wpaicg_chat_widget_toggles.length){
        for(var i=0;i<wpaicg_chat_widget_toggles.length;i++){
            var wpaicg_chat_widget_toggle = wpaicg_chat_widget_toggles[i];
            var wpaicg_chat_widget = wpaicg_chat_widget_toggle.closest('.wpaicg_chat_widget');
            wpaicg_chat_widget_toggle.addEventListener('click', function (e){
                e.preventDefault();
                wpaicg_chat_widget_toggle = e.currentTarget;
                if(wpaicg_chat_widget_toggle.classList.contains('wpaicg_widget_open')){
                    wpaicg_chat_widget_toggle.classList.remove('wpaicg_widget_open');
                    wpaicg_chat_widget.classList.remove('wpaicg_widget_open');
                }
                else{
                    wpaicg_chat_widget.classList.add('wpaicg_widget_open');
                    wpaicg_chat_widget_toggle.classList.add('wpaicg_widget_open');
                }
            });
        }
    }
    if(wpaicgChatDownloadButtons.length){
        for(var i=0;i < wpaicgChatDownloadButtons.length;i++){
            var wpaicgChatDownloadButton = wpaicgChatDownloadButtons[i];
            wpaicgChatDownloadButton.addEventListener('click', function (e){
                wpaicgChatDownloadButton = e.currentTarget;
                var type = wpaicgChatDownloadButton.getAttribute('data-type');
                var wpaicgWidgetContent,listMessages;
                if(type === 'shortcode') {
                    wpaicgWidgetContent = wpaicgChatDownloadButton.closest('.wpaicg-chat-shortcode');
                    listMessages = wpaicgWidgetContent.getElementsByClassName('wpaicg-chat-shortcode-messages');
                }
                else{
                    wpaicgWidgetContent = wpaicgChatDownloadButton.closest('.wpaicg_chat_widget_content');
                    listMessages = wpaicgWidgetContent.getElementsByClassName('wpaicg-chatbox-messages');
                }
                if(listMessages.length) {
                    var listMessage = listMessages[0];
                    var messages = [];
                    var chatMessages = listMessage.getElementsByTagName('li');
                    if (chatMessages.length) {
                        for (var i = 0; i < chatMessages.length; i++) {
                            messages.push(chatMessages[i].innerText.replace("\n",' '));
                        }
                    }
                    var messagesDownload = messages.join("\n");
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(messagesDownload));
                    element.setAttribute('download', 'chat.txt');

                    element.style.display = 'none';
                    document.body.appendChild(element);

                    element.click();

                    document.body.removeChild(element);
                }
            })
        }
    }
    if(wpaicgChatCloseButtons.length){
        for(var i = 0; i < wpaicgChatCloseButtons.length;i++){
            var wpaicgChatCloseButton = wpaicgChatCloseButtons[i];
            wpaicgChatCloseButton.addEventListener('click', function (e){
                wpaicgChatCloseButton = e.currentTarget;
                var wpaicgWidgetContent = wpaicgChatCloseButton.closest('.wpaicg_chat_widget_content');
                var chatbox = wpaicgWidgetContent.closest('.wpaicg_chat_widget');
                if(wpaicgWidgetContent.classList.contains('wpaicg-fullscreened')){
                    var fullScreenBtn = wpaicgWidgetContent.getElementsByClassName('wpaicg-chatbox-fullscreen')[0];
                    wpaicgFullScreen(fullScreenBtn);
                }
                chatbox.getElementsByClassName('wpaicg_toggle')[0].click();

            })
        }
    }
    
    function wpaicgFullScreen(btn){
        var type = btn.getAttribute('data-type');
        if(type === 'shortcode'){
            var wpaicgChatShortcode = btn.closest('.wpaicg-chat-shortcode');
            if (btn.classList.contains('wpaicg-fullscreen-box')) {
                // exit fullscreen
                btn.classList.remove('wpaicg-fullscreen-box');
                var chatWidth = wpaicgChatShortcode.getAttribute('data-old-width');
                var chatHeight = wpaicgChatShortcode.getAttribute('data-old-height');
                wpaicgChatShortcode.style.width = chatWidth;
                wpaicgChatShortcode.style.height = chatHeight;
                wpaicgChatShortcode.setAttribute('data-width', chatWidth);
                wpaicgChatShortcode.setAttribute('data-height', chatHeight);
                wpaicgChatShortcode.style.position = '';
                wpaicgChatShortcode.style.top = '';
                wpaicgChatShortcode.style.left = '';
                wpaicgChatShortcode.style.zIndex = '';
                wpaicgChatShortcode.classList.remove('wpaicg-fullscreened');
            }
            else{
                // enter fullscreen
                var newChatBoxWidth = document.body.offsetWidth;
                // var chatWidth = wpaicgChatShortcode.getAttribute('data-width');
                // var chatHeight = wpaicgChatShortcode.getAttribute('data-height');
                var chatWidth = window.getComputedStyle(wpaicgChatShortcode).width;
                var chatHeight = window.getComputedStyle(wpaicgChatShortcode).height;
                wpaicgChatShortcode.setAttribute('data-old-width', chatWidth);
                wpaicgChatShortcode.setAttribute('data-old-height', chatHeight);
                wpaicgChatShortcode.setAttribute('data-width', newChatBoxWidth);
                wpaicgChatShortcode.setAttribute('data-height', '100%');
                btn.classList.add('wpaicg-fullscreen-box');
                wpaicgChatShortcode.style.width = newChatBoxWidth;
                wpaicgChatShortcode.style.height = '100vh';
                wpaicgChatShortcode.style.position = 'fixed';
                wpaicgChatShortcode.style.top = 0;
                wpaicgChatShortcode.style.left = 0;
                wpaicgChatShortcode.style.zIndex = 999999999;
                wpaicgChatShortcode.classList.add('wpaicg-fullscreened');
                const demoContent = document.querySelector('.demo-page-fixed-content');
                if (demoContent) {
                    demoContent.style.position = 'static'; // Temporarily adjust position
                }
            }
            wpaicgChatShortcodeSize();

        }
        else {
            var wpaicgWidgetContent = btn.closest('.wpaicg_chat_widget_content');
            var chatbox = wpaicgWidgetContent.getElementsByClassName('wpaicg-chatbox')[0];
            if (btn.classList.contains('wpaicg-fullscreen-box')) {
                btn.classList.remove('wpaicg-fullscreen-box');
                var chatWidth = chatbox.getAttribute('data-old-width');
                var chatHeight = chatbox.getAttribute('data-old-height');
                chatbox.setAttribute('data-width', chatWidth);
                chatbox.setAttribute('data-height', chatHeight);
                wpaicgWidgetContent.style.position = 'absolute';
                wpaicgWidgetContent.style.bottom = '';
                wpaicgWidgetContent.style.left = '';
                wpaicgWidgetContent.classList.remove('wpaicg-fullscreened');
            } else {
                var newChatBoxWidth = document.body.offsetWidth;
                // var chatWidth = chatbox.getAttribute('data-width');
                // var chatHeight = chatbox.getAttribute('data-height');
                var chatWidth = window.getComputedStyle(chatbox).width;
                var chatHeight = window.getComputedStyle(chatbox).height;
                chatbox.setAttribute('data-old-width', chatWidth);
                chatbox.setAttribute('data-old-height', chatHeight);
                chatbox.setAttribute('data-width', newChatBoxWidth);
                chatbox.setAttribute('data-height', '100%');
                btn.classList.add('wpaicg-fullscreen-box');
                chatbox.style.width = newChatBoxWidth;
                chatbox.style.height = '100vh';
                wpaicgWidgetContent.style.position = 'fixed';
                wpaicgWidgetContent.style.bottom = 0;
                wpaicgWidgetContent.style.left = 0;
                wpaicgWidgetContent.classList.add('wpaicg-fullscreened');
                const demoContent = document.querySelector('.demo-page-fixed-content');
                if (demoContent) {
                    demoContent.style.position = 'static'; // Temporarily adjust position
                }
            }
            wpaicgChatBoxSize();
        }
    }
    if(wpaicgChatFullScreens.length){
        for(var i=0; i < wpaicgChatFullScreens.length; i++){
            var wpaicgChatFullScreen = wpaicgChatFullScreens[i];
            wpaicgChatFullScreen.addEventListener('click', function (e){
                wpaicgFullScreen(e.currentTarget);
            })
        }
    }
    function resizeChatWidgets() {
        if (wpaicg_chat_widgets !== null && wpaicg_chat_widgets.length) {
            for (var i = 0; i < wpaicg_chat_widgets.length; i++) {
                var wpaicg_chat_widget = wpaicg_chat_widgets[i];
                if (window.innerWidth < 350) {
                    wpaicg_chat_widget.getElementsByClassName('wpaicg-chatbox')[0].style.width = window.innerWidth + 'px';
                    wpaicg_chat_widget.getElementsByClassName('wpaicg_chat_widget_content')[0].style.width = window.innerWidth + 'px';
                } 
            }
        }
    }
    window.addEventListener('resize', function () {
        wpaicgChatBoxSize();
        wpaicgChatShortcodeSize();
        resizeChatWidgets();
    });
    wpaicgChatShortcodeSize();
    wpaicgChatBoxSize();
    resizeChatWidgets();

    function wpaicgescapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function wpaicgstartChatRecording() {
        let constraints = {audio: true, video: false}
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            wpaicgaudioContext = new wpaicgChatAudioContext();
            wpaicgChatStream = stream;
            wpaicgInput = wpaicgaudioContext.createMediaStreamSource(stream);
            wpaicgChatRec = new Recorder(wpaicgInput, {numChannels: 1});
            wpaicgChatRec.record();
        })
    }

    function wpaicgstopChatRecording(mic) {
        wpaicgChatRec.stop();
        wpaicgChatStream.getAudioTracks()[0].stop();
        wpaicgChatRec.exportWAV(function (blob) {
            let type = mic.getAttribute('data-type');
            let parentChat;
            let chatContent;
            let chatTyping;
            if (type === 'widget') {
                parentChat = mic.closest('.wpaicg-chatbox');
                chatContent = parentChat.querySelectorAll('.wpaicg-chatbox-content')[0];
                chatTyping = parentChat.querySelectorAll('.wpaicg-chatbox-typing')[0];
            } else {
                parentChat = mic.closest('.wpaicg-chat-shortcode');
                chatContent = parentChat.querySelectorAll('.wpaicg-chat-shortcode-content')[0];
                chatTyping = parentChat.querySelectorAll('.wpaicg-chat-shortcode-typing')[0];
            }
            wpaicgSendChatMessage(parentChat, chatTyping, type, blob);
        });
    }

    // Function to generate a random string
    function generateRandomString(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    function setupButtonListeners(isCopyEnabled, isFeedbackEnabled, class_ai_item, emptyClipboardSVG, checkedClipboardSVG, thumbsUpSVG, thumbsDownSVG, showFeedbackModal, aiBg, fontColor, usrBg, chat, wpaicg_nonce, chatbot_identity) {
        let hideTimeout;
    
        // Show buttons on hover or touchstart of the icon container
        jQuery(document).on('mouseenter touchstart', `li.${class_ai_item} .wpaicg-icon-container`, function (event) {
            clearTimeout(hideTimeout);
    
            // Prevent triggering on scroll or unintended touches
            if (event.type === 'touchstart') {
                event.stopPropagation();
            }
    
            const buttons = jQuery(this).find('.wpaicg-copy-button, .wpaicg-thumbs-up-button, .wpaicg-thumbs-down-button');
    
            // Display copy button if enabled
            if (isCopyEnabled) {
                buttons.filter('.wpaicg-copy-button').css({
                    display: 'inline-block',
                    opacity: 1,
                    visibility: 'visible'
                });
            }
    
            // Display feedback buttons if enabled
            if (isFeedbackEnabled) {
                buttons.filter('.wpaicg-thumbs-up-button, .wpaicg-thumbs-down-button').css({
                    display: 'inline-block',
                    opacity: 1,
                    visibility: 'visible'
                });
            }
        });
    
        // Hide buttons after leaving the icon container
        jQuery(document).on('mouseleave touchend', `li.${class_ai_item} .wpaicg-icon-container`, function () {
            const buttons = jQuery(this).find('.wpaicg-copy-button, .wpaicg-thumbs-up-button, .wpaicg-thumbs-down-button');
            hideTimeout = setTimeout(() => {
                buttons.css({
                    opacity: 0,
                    visibility: 'hidden',
                    display: 'none'
                });
            }, 2000);
        });
    
        // Copy text functionality remains unchanged
        jQuery(document).on('click', '.wpaicg-copy-button', function () {
            const chatId = jQuery(this).data('chat-id');
            const messageText = document.getElementById(chatId).innerText;
    
            navigator.clipboard.writeText(messageText).then(() => {
                // Change icon to check mark
                jQuery(this).html(checkedClipboardSVG);
                setTimeout(() => {
                    // Reset icon to original after 2 seconds
                    jQuery(this).html(emptyClipboardSVG);
                }, 2000);
            }).catch(err => console.error('Failed to copy text: ', err));
        });
    
        // Feedback functionality remains unchanged
        jQuery(document).on('click', '.wpaicg-thumbs-up-button, .wpaicg-thumbs-down-button', function () {
            const feedbackType = jQuery(this).hasClass('wpaicg-thumbs-up-button') ? 'up' : 'down';
            const chatId = jQuery(this).data('chat-id').replace('wpaicg-chat-message-', '');
            showFeedbackModal(feedbackType, chatId, aiBg, fontColor, usrBg, chat, wpaicg_nonce, chatbot_identity);
        });
    }
    
    function showFeedbackModal(feedbackType, chatId, bgColor, textColor, usrBg, chat, wpaicg_nonce, chatbot_identity) {
        const chatWidget = jQuery('.wpaicg_chat_widget');
        const feedbackTitle = chat.getAttribute('data-feedback_title') || 'Feedback';
        const feedbackMessage = chat.getAttribute('data-feedback_message') || 'Please provide details: (optional)';
        const feedbackSuccessMessage = chat.getAttribute('data-feedback_success') || 'Thank you for your feedback!';

        const chatShortcode = jQuery(chat).closest('.wpaicg-chat-shortcode');
        const wasFullscreen = chatShortcode.hasClass('wpaicg-fullscreened');
    
        if (wasFullscreen) {
            // Exit fullscreen mode before showing feedback modal
            const fullScreenBtn = chatShortcode.find('.wpaicg-chatbox-fullscreen');
            wpaicgFullScreen(fullScreenBtn[0]); // Exit fullscreen
        }    
    
        if (chatWidget.hasClass('wpaicg_widget_open')) {
            chatWidget.data('was-open', true);
            chatWidget.removeClass('wpaicg_widget_open');
        } else {
            chatWidget.data('was-open', false);
        }
    
        const modalHtml = ` 
            <style>
                @keyframes wpaicg-feedback-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
        
                .wpaicg-feedback-spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid ${textColor};
                    border-top: 2px solid ${bgColor};
                    border-radius: 50%;
                    animation: wpaicg-feedback-spin 1s linear infinite;
                }
                .wpaicg-feedback-message {
                    color: ${textColor};
                }
            </style>
            <div class="wpaicg-feedback-modal-overlay">
                <div class="wpaicg-feedback-modal" style="background-color:${bgColor};color:${textColor};position:relative;">
                    <button class="wpaicg-feedback-modal-close" style="position:absolute; top:10px; right:10px; background:none; border:none; color:${textColor}; font-size:18px; cursor:pointer;">&times;</button>
                    <h2 style="background-color:${bgColor};color:${textColor};">${feedbackTitle}</h2>
                    <p>${feedbackMessage}</p>
                    <textarea class="wpaicg-feedback-textarea"></textarea>
                    <div class="wpaicg-feedback-modal-buttons">
                        <div class="wpaicg-feedback-message" style="display:none;"></div>
                        <button class="wpaicg-feedback-modal-submit" style="background-color:${usrBg};color:${textColor};border:none;" data-feedback-type="${feedbackType}" data-chat-id="${chatId}">
                            Submit
                            <span class="wpaicg-feedback-spinner" style="display:none; margin-left:5px; border: 2px solid ${textColor}; border-top: 2px solid ${bgColor}; border-radius: 50%; width: 16px; height: 16px; animation: wpaicg-feedback-spin 1s linear infinite;"></span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    
        jQuery('body').append(modalHtml);
    
        jQuery('.wpaicg-feedback-modal-close').on('click', function () {
            jQuery('.wpaicg-feedback-modal-overlay').fadeOut(300, function () {
                jQuery(this).remove();
                if (wasFullscreen) {
                    // Restore fullscreen after feedback modal is closed
                    const fullScreenBtn = chatShortcode.find('.wpaicg-chatbox-fullscreen');
                    wpaicgFullScreen(fullScreenBtn[0]); // Re-enter fullscreen
                }
                if (chatWidget.data('was-open')) {
                    chatWidget.addClass('wpaicg_widget_open');
                }
            });
        });
    
        jQuery('.wpaicg-feedback-modal-submit').on('click', function() {
            const modal = jQuery(this).closest('.wpaicg-feedback-modal');
            const feedbackText = modal.find('.wpaicg-feedback-textarea').val();
            const feedbackType = jQuery(this).data('feedback-type');
            const chatId = jQuery(this).data('chat-id');
            const nonce = wpaicg_nonce;
            const submitButton = jQuery(this);
            const spinner = submitButton.find('.wpaicg-feedback-spinner');
            const feedbackMessageElement = modal.find('.wpaicg-feedback-message');
    
            spinner.show();
            submitButton.prop('disabled', true);
    
            jQuery.ajax({
                url: wpaicgParams.ajax_url,
                method: 'POST',
                data: {
                    action: 'wpaicg_submit_feedback',
                    chatId: chatId,
                    feedbackType: feedbackType,
                    feedbackDetails: feedbackText,
                    _wpnonce: nonce,
                    chatbot_id: chatbot_identity,
                },
                success: function(response) {
                    feedbackMessageElement.html(`<span style="color:${textColor};">${feedbackSuccessMessage}</span>`).fadeIn(300);
                    setTimeout(() => {
                        jQuery('.wpaicg-feedback-modal-overlay').fadeOut(300, function() {
                            jQuery(this).remove();
                            if (chatWidget.data('was-open')) {
                                chatWidget.addClass('wpaicg_widget_open');
                            }
                            if (wasFullscreen) {
                                const fullScreenBtn = chatShortcode.find('.wpaicg-chatbox-fullscreen');
                                wpaicgFullScreen(fullScreenBtn[0]); // Re-enter fullscreen
                            }
                        });
                    }, 2000);
                },
                error: function(error) {
                    feedbackMessageElement.html(`<span style="color:${textColor};">Error. Please try again later.</span>`).fadeIn(300);
                    setTimeout(() => {
                        jQuery('.wpaicg-feedback-modal-overlay').fadeOut(300, function() {
                            jQuery(this).remove();
                            if (chatWidget.data('was-open')) {
                                chatWidget.addClass('wpaicg_widget_open');
                            }
                            if (wasFullscreen) {
                                const fullScreenBtn = chatShortcode.find('.wpaicg-chatbox-fullscreen');
                                wpaicgFullScreen(fullScreenBtn[0]); // Re-enter fullscreen
                            }
                        });
                    }, 2000);
                },
                complete: function() {
                    spinner.hide();
                    submitButton.prop('disabled', false);
                }
            });
        });
    }
    
    function wpaicgSendChatMessage(chat, typing, type, blob) {
        hideConversationStarters();
        let wpaicg_box_typing = typing;
        let wpaicg_ai_thinking, wpaicg_messages_box, class_user_item, class_ai_item;
        let wpaicgMessage = '';
        let wpaicgData = new FormData();
        let wpaicg_you = chat.getAttribute('data-you') + ':';
        let wpaicg_ai_name = chat.getAttribute('data-ai-name') + ':';
        let wpaicg_nonce = chat.getAttribute('data-nonce');
        let wpaicg_use_avatar = parseInt(chat.getAttribute('data-use-avatar'));
        let wpaicg_bot_id = parseInt(chat.getAttribute('data-bot-id'));
        let wpaicg_user_avatar = chat.getAttribute('data-user-avatar');
        let wpaicg_ai_avatar = chat.getAttribute('data-ai-avatar');
        let wpaicg_user_bg = chat.getAttribute('data-user-bg-color');
        let wpaicg_font_size = chat.getAttribute('data-fontsize');
        let wpaicg_speech = chat.getAttribute('data-speech');
        let wpaicg_voice = chat.getAttribute('data-voice');
        let elevenlabs_model = chat.getAttribute('data-elevenlabs-model');
        if (elevenlabs_model === null || elevenlabs_model === undefined) {
            elevenlabs_model = chat.getAttribute('data-elevenlabs_model');
        }
        let elevenlabs_voice = chat.getAttribute('data-elevenlabs-voice');
        if (elevenlabs_voice === null || elevenlabs_voice === undefined) {
            elevenlabs_voice = chat.getAttribute('data-elevenlabs_voice');
        }
        let wpaicg_voice_error = chat.getAttribute('data-voice-error');
        let wpaicg_typewriter_effect = chat.getAttribute('data-typewriter-effect');
        let wpaicg_typewriter_speed = chat.getAttribute('data-typewriter-speed');

        let url = chat.getAttribute('data-url');
        let post_id = chat.getAttribute('data-post-id');
        let wpaicg_ai_bg = chat.getAttribute('data-ai-bg-color');
        let wpaicg_font_color = chat.getAttribute('data-color');
        let voice_service = chat.getAttribute('data-voice_service');

        let voice_language = chat.getAttribute('data-voice_language');
        let voice_name = chat.getAttribute('data-voice_name');
        let voice_device = chat.getAttribute('data-voice_device');
        let openai_model = chat.getAttribute('data-openai_model');

        let openai_voice = chat.getAttribute('data-openai_voice');

        let openai_output_format = chat.getAttribute('data-openai_output_format');

        let openai_voice_speed = chat.getAttribute('data-openai_voice_speed');

        let openai_stream_nav = chat.getAttribute('data-openai_stream_nav');

        let voice_speed = chat.getAttribute('data-voice_speed');
        let voice_pitch = chat.getAttribute('data-voice_pitch');
        var chat_pdf = chat.getAttribute('data-pdf');

        // Handle image upload
        var imageInput = document.getElementById('imageUpload');
        var imageUrl = ''; // Variable to store the URL of the uploaded image for preview
        if(imageInput){
            if (imageInput.files && imageInput.files[0]) {
                // Append image file to FormData object
                wpaicgData.append('image', imageInput.files[0], imageInput.files[0].name);
                // Create a URL for the uploaded image file for preview
                imageUrl = URL.createObjectURL(imageInput.files[0]);
            }
        }

        if (type === 'widget') {
            wpaicg_ai_thinking = chat.getElementsByClassName('wpaicg-bot-thinking')[0];
            wpaicg_messages_box = chat.getElementsByClassName('wpaicg-chatbox-messages')[0];
            class_user_item = 'wpaicg-chat-user-message';
            class_ai_item = 'wpaicg-chat-ai-message';
            wpaicg_messages_box.scrollTop = wpaicg_messages_box.scrollHeight;
            // Retrieve all message elements
            const messages = wpaicg_messages_box.querySelectorAll('li');
            // Ensure messages exist and scroll to the last message
            if (messages.length > 0) {
                messages[messages.length - 1].scrollIntoView();
            } 
            
        } else {
            wpaicg_ai_thinking = chat.getElementsByClassName('wpaicg-bot-thinking')[0];
            wpaicg_messages_box = chat.getElementsByClassName('wpaicg-chat-shortcode-messages')[0];
            class_user_item = 'wpaicg-user-message';
            class_ai_item = 'wpaicg-ai-message';
        }
        if (wpaicg_use_avatar) {
            wpaicg_you = '<img src="' + wpaicg_user_avatar + '" height="40" width="40">';
            wpaicg_ai_name = '<img src="' + wpaicg_ai_avatar + '" height="40" width="40">';
        }
        wpaicg_ai_thinking.style.display = 'block';
        let wpaicg_question = wpaicgescapeHtml(wpaicg_box_typing.value);
        if (!wpaicg_question.trim() && blob === undefined) {
            wpaicg_ai_thinking.style.display = 'none';
            return; // Exit the function if no message or blob is provided
        }
        wpaicgMessage += '<li class="' + class_user_item + '" style="background-color:' + wpaicg_user_bg + ';font-size: ' + wpaicg_font_size + 'px;color: ' + wpaicg_font_color + '">';
        wpaicgMessage += '<strong class="wpaicg-chat-avatar">' + wpaicg_you + '</strong>';
        wpaicgData.append('_wpnonce', wpaicg_nonce);
        wpaicgData.append('post_id', post_id);
        if(chat_pdf && chat_pdf !== null) {
            wpaicgData.append('namespace', chat_pdf);
        }
        wpaicgData.append('url', url);
        if (type === 'widget') {
            wpaicgData.append('action', 'wpaicg_chatbox_message');
        } else {
            wpaicgData.append('action', 'wpaicg_chat_shortcode_message');
        }
        if (blob !== undefined) {
            let url = URL.createObjectURL(blob);
            wpaicgMessage += '<audio src="' + url + '" controls="true"></audio>';
            wpaicgData.append('audio', blob, 'wpaicg-chat-recording.wav');
        } else if (wpaicg_question !== '') {
            wpaicgData.append('message', wpaicg_question);
            wpaicgMessage += wpaicg_question.replace(/\n/g,'<br>');

        }
       
        wpaicgData.append('bot_id',wpaicg_bot_id);
        wpaicgMessage += '</li>';
        // If an image URL is available, add an <img> tag to display the image
        if (imageUrl !== '') {
            wpaicgMessage += '<li class="' + class_user_item + '" style="background-color:' + wpaicg_user_bg + ';font-size: ' + wpaicg_font_size + 'px;color: ' + wpaicg_font_color + '">';
            wpaicgMessage += '<div style="max-width: 300px; height: auto; display: flex;">';
            wpaicgMessage += '<img src="' + imageUrl + '" style="max-width: 100%; height: auto;" onload="this.parentElement.parentElement.parentElement.scrollTop = this.parentElement.parentElement.parentElement.scrollHeight;">';
            wpaicgMessage += '</div>'; // Closing the div tag
            wpaicgMessage += '</li>';
        }
        wpaicg_messages_box.innerHTML += wpaicgMessage;
        wpaicg_messages_box.scrollTop = wpaicg_messages_box.scrollHeight;

        // Hide the thumbnail placeholder
        var thumbnailPlaceholder = document.querySelector('.wpaicg-thumbnail-placeholder');
        if (thumbnailPlaceholder) {
            thumbnailPlaceholder.style.display = 'none'; // Hide the thumbnail after message is sent
        }

        // Reset the image input after sending the message if imageInput exists first
        if (imageInput) {
            imageInput.value = '';
        }
                
        let chat_type = chat.getAttribute('data-type');
        
        let stream_nav;
        let chatbot_identity;

        // Check if it's a bot with dynamic ID
        if (wpaicg_bot_id && wpaicg_bot_id !== "0") {
            stream_nav = openai_stream_nav;
            chatbot_identity = 'custom_bot_' + wpaicg_bot_id;
        } else {
            // Check if it's a shortcode or widget based on chat_type
            if (chat_type === "shortcode") {
                stream_nav = chat.getAttribute('data-openai_stream_nav');
                chatbot_identity = 'shortcode';
            } else if (chat_type === "widget") {
                stream_nav = chat.getAttribute('data-openai_stream_nav');
                chatbot_identity = 'widget';
            }
        }
        wpaicgData.append('chatbot_identity', chatbot_identity);

        // Check for existing client_id in localStorage
        let clientID = localStorage.getItem('wpaicg_chat_client_id');
        if (!clientID) {
            // Generate and store a new client ID if not found
            clientID = generateRandomString(10); // Generate a 10 character string
            localStorage.setItem('wpaicg_chat_client_id', clientID);
        }

        //append client_id to wpaicgData
        wpaicgData.append('wpaicg_chat_client_id', clientID);

        // Hide the image thumbnail after sending the message
        if (imageInputThumbnail) {
            imageInputThumbnail.style.display = 'none';
        }

        // Function to update chat history in local storage for a specific bot identity
        function updateChatHistory(message, sender, wpaicg_randomnum) {
            let chatHistoryKey = 'wpaicg_chat_history_' + chatbot_identity + '_' + clientID;
            let chatHistory = localStorage.getItem(chatHistoryKey);
            chatHistory = chatHistory ? JSON.parse(chatHistory) : [];
        
            // Format and add the new message
            let formattedMessage = (sender === 'user' ? "Human: " : "AI: ") + message.trim();

            chatHistory.push({
                id: wpaicg_randomnum,
                text: formattedMessage,
            });
        
            // Keep only the last 10 messages if there are more than 5
            if (chatHistory.length > 10) {
                chatHistory = chatHistory.slice(-10);
            }
        
            // Calculate total character count
            let totalCharCount = chatHistory.reduce((total, msg) => total + msg.length, 0);
        
            // Clear chat history if total character count exceeds 20000
            if (totalCharCount > 20000) {
                chatHistory = [];
            }
        
            localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory));
        }
        
        if (stream_nav === "1") {
            updateChatHistory(wpaicg_question, 'user');
            wpaicgData.append('wpaicg_chat_history', localStorage.getItem('wpaicg_chat_history_' + chatbot_identity + '_' + clientID));
            handleStreaming(wpaicgData,wpaicg_messages_box,wpaicg_box_typing,wpaicg_ai_thinking,class_ai_item,chat, chatbot_identity, clientID, wpaicg_use_avatar, wpaicg_ai_avatar,wpaicg_nonce);
        }
        else {

            updateChatHistory(wpaicg_question, 'user');
            // append chat history to wpaicgData
            wpaicgData.append('wpaicg_chat_history', localStorage.getItem('wpaicg_chat_history_' + chatbot_identity + '_' + clientID));
            var wpaicg_randomnum = Math.floor((Math.random() * 100000) + 1);
            const chatId = `wpaicg-chat-message-${wpaicg_randomnum}`;
            // append wpaicg_randomnum to wpaicgData
            wpaicgData.append('chat_id', wpaicg_randomnum);
            // Extract copy and feedback settings from the chat element
            const copyEnabled = chat.getAttribute('data-copy_btn') === "1";
            const feedbackEnabled = chat.getAttribute('data-feedback_btn') === "1";
            const fontColor = chat.getAttribute('data-color');
            const usrBg = chat.getAttribute('data-user-bg-color');
            const emptyClipboardSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${fontColor}" class="bi bi-copy" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
            </svg>`;
            const checkedClipboardSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${fontColor}" class="bi bi-check2" viewBox="0 0 16 16">
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
            </svg>`;
    
            const thumbsUpSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${fontColor}" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
            <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
            </svg>`;
            const thumbsDownSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${fontColor}" class="bi bi-hand-thumbs-down" viewBox="0 0 16 16">
            <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1"/>
            </svg>`;
            const xhttp = new XMLHttpRequest();
            wpaicg_box_typing.value = '';
            xhttp.open('POST', wpaicgParams.ajax_url, true);
            xhttp.send(wpaicgData);
            xhttp.onreadystatechange = function (oEvent) {
                if (xhttp.readyState === 4) {
                    var wpaicg_message = '';
                    var wpaicg_response_text = '';
                    if (xhttp.status === 200) {
                        var wpaicg_response = this.responseText;
                        if (wpaicg_response !== '') {
                            wpaicg_response = JSON.parse(wpaicg_response);
                            wpaicg_ai_thinking.style.display = 'none'
                            if (wpaicg_response.status === 'success') {
                                wpaicg_response_text = wpaicg_response.data;
                                wpaicg_message = `
                                    <li class="${class_ai_item} wpaicg-icon-container" style="background-color:${wpaicg_ai_bg};font-size:${wpaicg_font_size}px;color:${wpaicg_font_color}">
                                        <p style="width:100%">
                                            <strong class="wpaicg-chat-avatar">${wpaicg_ai_name}</strong>
                                            <span class="wpaicg-chat-message" id="${chatId}">${wpaicg_response_text}</span>
                                            ${copyEnabled ? `<button class="wpaicg-copy-button" data-chat-id="${chatId}">${emptyClipboardSVG}</button>` : ''}
                                            ${feedbackEnabled ? `
                                                <button class="wpaicg-thumbs-up-button" data-chat-id="${chatId}">${thumbsUpSVG}</button>
                                                <button class="wpaicg-thumbs-down-button" data-chat-id="${chatId}">${thumbsDownSVG}</button>` : ''}
                                        </p>
                                    </li>
                                `;
                            } else {
                                wpaicg_response_text = wpaicg_response.msg;
                                wpaicg_message = '<li class="' + class_ai_item + '" style="background-color:' + wpaicg_ai_bg + ';font-size: ' + wpaicg_font_size + 'px;color: ' + wpaicg_font_color + '"><p style="width:100%"><strong class="wpaicg-chat-avatar">' + wpaicg_ai_name + '</strong><span class="wpaicg-chat-message wpaicg-chat-message-error" id="wpaicg-chat-message-' + wpaicg_randomnum + '"></span>';
                            }
                        }
                    } else {
                        wpaicg_message = '<li class="' + class_ai_item + '" style="background-color:' + wpaicg_ai_bg + ';font-size: ' + wpaicg_font_size + 'px;color: ' + wpaicg_font_color + '"><p style="width:100%"><strong class="wpaicg-chat-avatar">' + wpaicg_ai_name + '</strong><span class="wpaicg-chat-message wpaicg-chat-message-error" id="wpaicg-chat-message-' + wpaicg_randomnum + '"></span>';
                        wpaicg_response_text = 'Something went wrong. Please clear your cache and try again.';
                        wpaicg_ai_thinking.style.display = 'none';
                    }
                    if (wpaicg_response_text === 'null' || wpaicg_response_text === null) {
                        wpaicg_response_text = 'Empty response from api. Check your server logs for more details.';
                    }
                    setupButtonListeners(copyEnabled, feedbackEnabled, class_ai_item, emptyClipboardSVG, checkedClipboardSVG, thumbsUpSVG, thumbsDownSVG, showFeedbackModal, wpaicg_ai_bg, wpaicg_font_color, usrBg, chat, wpaicg_nonce, chatbot_identity);
                    updateChatHistory(wpaicg_response_text, 'ai',wpaicg_randomnum);
                    if (wpaicg_response_text !== '' && wpaicg_message !== '') {
                        if(parseInt(wpaicg_speech) == 1){
                            if(voice_service === 'google'){
                                wpaicg_ai_thinking.style.display = 'block';
                                let speechData = new FormData();
                                speechData.append('nonce', wpaicg_nonce);
                                speechData.append('action', 'wpaicg_google_speech');
                                speechData.append('language', voice_language);
                                speechData.append('name', voice_name);
                                speechData.append('device', voice_device);
                                speechData.append('speed', voice_speed);
                                speechData.append('pitch', voice_pitch);
                                speechData.append('text', wpaicg_response_text);
                                var speechRequest = new XMLHttpRequest();
                                speechRequest.open("POST", wpaicgParams.ajax_url);
                                speechRequest.onload = function () {
                                    var result = speechRequest.responseText;
                                    try {
                                        result = JSON.parse(result);
                                        if(result.status === 'success'){
                                            var byteCharacters = atob(result.audio);
                                            const byteNumbers = new Array(byteCharacters.length);
                                            for (let i = 0; i < byteCharacters.length; i++) {
                                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                                            }
                                            const byteArray = new Uint8Array(byteNumbers);
                                            const blob = new Blob([byteArray], {type: 'audio/mp3'});
                                            const blobUrl = URL.createObjectURL(blob);
                                            wpaicg_message += '<audio style="margin-top:2px;width: 100%" controls="controls"><source type="audio/mpeg" src="' + blobUrl + '"></audio>';
                                            wpaicg_message += '</p></li>';
                                            wpaicg_ai_thinking.style.display = 'none';
                                            wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                        }
                                        else{
                                            var errorMessageDetail = 'Google: ' + result.msg;
                                            wpaicg_ai_thinking.style.display = 'none';
                                            if (parseInt(wpaicg_voice_error) !== 1) {
                                                wpaicg_message += '<span style="width: 100%;display: block;font-size: 11px;">' + errorMessageDetail + '</span>';
                                            }
                                            else if (typeof wpaicg_response !== 'undefined' && typeof wpaicg_response.log !== 'undefined' && wpaicg_response.log !== '') {
                                                var speechLogMessage = new FormData();
                                                speechLogMessage.append('nonce', wpaicg_nonce);
                                                speechLogMessage.append('log_id', wpaicg_response.log);
                                                speechLogMessage.append('message', errorMessageDetail);
                                                speechLogMessage.append('action', 'wpaicg_speech_error_log');
                                                var speechErrorRequest = new XMLHttpRequest();
                                                speechErrorRequest.open("POST", wpaicgParams.ajax_url);
                                                speechErrorRequest.send(speechLogMessage);
                                            }
                                            wpaicg_message += '</p></li>';
                                            wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                        }
                                    }
                                    catch (errorSpeech){

                                    }
                                }
                                speechRequest.send(speechData);
                            }
                            else if (voice_service === 'openai') {
                                // OpenAI TTS code
                                let speechData = new FormData();
                                speechData.append('action', 'wpaicg_openai_speech');
                                speechData.append('nonce', wpaicg_nonce);
                                speechData.append('text', wpaicg_response_text);
                            

                                speechData.append('model', openai_model);
                                speechData.append('voice', openai_voice);
                                speechData.append('output_format', openai_output_format);
                                speechData.append('speed', openai_voice_speed);
                            
                                // Display some sort of loading indicator
                                wpaicg_ai_thinking.style.display = 'block';
                            
                                var speechRequest = new XMLHttpRequest();
                                speechRequest.open("POST", wpaicgParams.ajax_url);
                                speechRequest.responseType = "arraybuffer"; // Expecting raw audio data
                            
                                speechRequest.onload = function () {
                                    if (speechRequest.status === 200) {
                                        wpaicg_ai_thinking.style.display = 'none';
                            
                                        const audioData = speechRequest.response;
                                        const blobMimeType = getBlobMimeType(openai_output_format); // Get the MIME type based on the format
                                        const blob = new Blob([audioData], { type: blobMimeType });
                                        const blobUrl = URL.createObjectURL(blob);
                            
                                        // Update your message UI here
                                        wpaicg_message += '<audio style="margin-top:2px;width: 100%" controls="controls"><source type="audio/mpeg" src="' + blobUrl + '"></audio>';
                                        wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                    } else {
                                        // Handle HTTP errors
                                        wpaicg_ai_thinking.style.display = 'none';
                                        console.error('Error generating speech with OpenAI:', speechRequest.statusText);
                                        // Update your message UI to show the error
                                        wpaicg_message += '<span style="width: 100%;display: block;font-size: 11px;">Error generating speech with OpenAI</span>';
                                        wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                    }
                                };
                            
                                speechRequest.onerror = function () {
                                    // Handle network errors
                                    wpaicg_ai_thinking.style.display = 'none';
                                    console.error('Network error during speech generation with OpenAI');
                                    // Update your message UI to show the network error
                                    wpaicg_message += '<span style="width: 100%;display: block;font-size: 11px;">Network error during speech generation</span>';
                                    wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                };
                            
                                speechRequest.send(speechData);
                                // Utility function to get the correct MIME type
                                function getBlobMimeType(format) {
                                    switch (format) {
                                        case 'opus':
                                            return 'audio/opus';
                                        case 'aac':
                                            return 'audio/aac';
                                        case 'flac':
                                            return 'audio/flac';
                                        default:
                                            return 'audio/mpeg'; // Default to MP3
                                    }
                                }
                            }
                            
                            else {
                                let speechData = new FormData();
                                speechData.append('nonce', wpaicg_nonce);
                                speechData.append('message', wpaicg_response_text);
                                speechData.append('voice', wpaicg_voice);
                                speechData.append('elevenlabs_model', elevenlabs_model);
                                speechData.append('action', 'wpaicg_text_to_speech');
                                wpaicg_ai_thinking.style.display = 'block';
                                var speechRequest = new XMLHttpRequest();
                                speechRequest.open("POST", wpaicgParams.ajax_url);
                                speechRequest.responseType = "arraybuffer";
                                speechRequest.onload = function () {
                                    wpaicg_ai_thinking.style.display = 'none';
                                    var blob = new Blob([speechRequest.response], {type: "audio/mpeg"});
                                    var fr = new FileReader();
                                    fr.onload = function () {
                                        var fileText = this.result;
                                        try {
                                            var errorMessage = JSON.parse(fileText);
                                            var errorMessageDetail = 'ElevenLabs: ' + errorMessage.detail.message;
                                            if (parseInt(wpaicg_voice_error) !== 1) {
                                                wpaicg_message += '<span style="width: 100%;display: block;font-size: 11px;">' + errorMessageDetail + '</span>';
                                            } else if (typeof wpaicg_response !== 'undefined' && typeof wpaicg_response.log !== 'undefined' && wpaicg_response.log !== '') {
                                                var speechLogMessage = new FormData();
                                                speechLogMessage.append('nonce', wpaicg_nonce);
                                                speechLogMessage.append('log_id', wpaicg_response.log);
                                                speechLogMessage.append('message', errorMessageDetail);
                                                speechLogMessage.append('action', 'wpaicg_speech_error_log');
                                                var speechErrorRequest = new XMLHttpRequest();
                                                speechErrorRequest.open("POST", wpaicgParams.ajax_url);
                                                speechErrorRequest.send(speechLogMessage);
                                            }
                                            wpaicg_message += '</p></li>';
                                            wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                        } catch (errorBlob) {
                                            var blobUrl = URL.createObjectURL(blob);
                                            wpaicg_message += '<audio style="margin-top:2px;width: 100%" controls="controls"><source type="audio/mpeg" src="' + blobUrl + '"></audio>';
                                            wpaicg_message += '</p></li>';
                                            wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                        }
                                    }
                                    fr.readAsText(blob);
                                }
                                speechRequest.send(speechData);
                            }
                        }
                        else{
                            wpaicg_message += '</p></li>';
                            wpaicgWriteMessage(wpaicg_messages_box,wpaicg_message,wpaicg_randomnum,wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                        }
                    }
                }
            }
        }
    }

    // Function to hide all conversation starters
    function hideConversationStarters() {
        const starters = document.querySelectorAll('.wpaicg-conversation-starters');
        starters.forEach(starter => {
            starter.style.display = 'none';
        });
    }

    function handleStreaming(wpaicgData, wpaicg_messages_box, wpaicg_box_typing, wpaicg_ai_thinking, class_ai_item, chat, chatbot_identity, clientID, wpaicg_use_avatar, wpaicg_ai_avatar,wpaicg_nonce) {
        const aiName = wpaicg_use_avatar ? `<img src="${wpaicg_ai_avatar}" height="40" width="40">` : `${chat.getAttribute('data-ai-name')}:`;
        const fontSize = chat.getAttribute('data-fontsize');
        const aiBg = chat.getAttribute('data-ai-bg-color');
        const fontColor = chat.getAttribute('data-color');
        const usrBg = chat.getAttribute('data-user-bg-color');
        const copyEnabled = chat.getAttribute('data-copy_btn') === "1";
        const feedbackEnabled = chat.getAttribute('data-feedback_btn') === "1";

        wpaicg_box_typing.value = '';
        // add chatID to the query string
        const chatId = `wpaicg-chat-message-${Math.floor(Math.random() * 100000) + 1}`;
        const cleanedChatId = chatId.replace('wpaicg-chat-message-', ''); // Clean the chatId by removing the prefix
        wpaicgData.append('chat_id', cleanedChatId);
        const queryString = new URLSearchParams(wpaicgData).toString();

        const eventSource = new EventSource(`${wpaicgParams.ajax_url}?${queryString}`);

        const emptyClipboardSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${fontColor}" class="bi bi-copy" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
        </svg>`;
        const checkedClipboardSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${fontColor}" class="bi bi-check2" viewBox="0 0 16 16">
        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
        </svg>`;

        const thumbsUpSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${fontColor}" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
        </svg>`;
        const thumbsDownSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${fontColor}" class="bi bi-hand-thumbs-down" viewBox="0 0 16 16">
        <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1"/>
        </svg>`;
        
        const messageHtml = `
            <li class="${class_ai_item} wpaicg-icon-container" style="background-color:${aiBg};font-size:${fontSize}px;color:${fontColor}">
                <p style="width:100%">
                    <strong class="wpaicg-chat-avatar">${aiName}</strong>
                    <span class="wpaicg-chat-message" id="${chatId}"></span>
                    ${copyEnabled ? `<button class="wpaicg-copy-button" data-chat-id="${chatId}">${emptyClipboardSVG}</button>` : ''}
                    ${feedbackEnabled ? `<button class="wpaicg-thumbs-up-button" data-chat-id="${chatId}">${thumbsUpSVG}</button>
                    <button class="wpaicg-thumbs-down-button" data-chat-id="${chatId}">${thumbsDownSVG}</button>` : ''}
                </p>
            </li>
        `;

        // Buffer to accumulate chunks
        let buffer = '';
    
        function processBuffer() {
            // Call the unified processMarkdown function for stream mode
            processMarkdown(buffer, true, chatId);
        }
    
        function updateChatHistory(message, sender, chatId) {
            const key = `wpaicg_chat_history_${chatbot_identity}_${clientID}`;
            const history = JSON.parse(localStorage.getItem(key) || '[]');
            
            // Remove the 'wpaicg-chat-message-' prefix from the chatId
            const simpleChatId = chatId.replace('wpaicg-chat-message-', '');
        
            history.push({
                id: simpleChatId, // Store the simplified chat ID as a separate key
                text: `${sender === 'user' ? "Human: " : "AI: "} ${message.trim()}`
            });
        
            localStorage.setItem(key, JSON.stringify(history));
        }
    
        let dataQueue = [];
        let isProcessing = false;
        let completeAIResponse = '';
        
        function typeWriter(text, i, elementId, callback) {
            toggleBlinkingCursor(false);
            if (i < text.length) {
                const charToAdd = text.charAt(i);
                if (charToAdd === '<') {
                    const tag = text.slice(i, i + 4);
                    if (tag === '<br>') {
                        jQuery(`#${elementId}`).append(tag);
                        i += 4;
                    } else {
                        jQuery(`#${elementId}`).append(charToAdd);
                        i++;
                    }
                } else {
                    jQuery(`#${elementId}`).append(charToAdd);
                    i++;
                }
                setTimeout(() => typeWriter(text, i, elementId, callback), 1);
            } else if (callback) {
                callback();
                scrollToBottom();
            }
        }
    
        function scrollToBottom() {
            wpaicg_messages_box.scrollTop = wpaicg_messages_box.scrollHeight;
        }
    
        function processQueue() {
            if (dataQueue.length && !isProcessing) {
                isProcessing = true;
                const nextChunk = dataQueue.shift();
                typeWriter(nextChunk, 0, chatId, () => {
                    isProcessing = false;
                    processQueue();
                });
            } else {
                toggleBlinkingCursor(false);
            }
        }
    
        function toggleBlinkingCursor(isVisible) {
            const cursorElement = jQuery(`#${chatId} .blinking-cursor`);
            if (isVisible) {
                if (!cursorElement.length) {
                    jQuery(`#${chatId}`).append('<span class="blinking-cursor">|</span>');
                }
            } else {
                cursorElement.remove();
            }
        }
            
        eventSource.onopen = () => {
            toggleBlinkingCursor(true);
            wpaicg_messages_box.innerHTML += messageHtml;
        };
    
        eventSource.onmessage = e => {
            wpaicg_ai_thinking.style.display = 'none';
        
            const resultData = JSON.parse(e.data);
        
            if (e.data === "[DONE]" || resultData.choices?.[0]?.finish_reason === "stop" || resultData.choices?.[0]?.finish_reason === "length" || resultData.choices?.[0]?.finish_details?.type === "stop") {
                eventSource.close();
                toggleBlinkingCursor(false);
                updateChatHistory(completeAIResponse, 'ai', chatId);
                return;
            }
        
            if (resultData.tokenLimitReached || resultData.messageFlagged || resultData.pineconeError || resultData.ipBanned || resultData.modflag) {
                document.getElementById(chatId).innerHTML = `<span class="wpaicg-chat-message">${resultData.msg}</span>`;
                wpaicg_ai_thinking.style.display = 'none';
                eventSource.close();
                toggleBlinkingCursor(false);
                scrollToBottom();
                return;
            }
        
            if (resultData.error) {
                dataQueue.push(resultData.error.message);
            } else {
                const content = resultData.choices?.[0]?.delta?.content || resultData.choices?.[0]?.text || '';
                buffer += content;
                processBuffer();
                completeAIResponse += content;
            }
        
            processQueue();
            scrollToBottom();
        };

        // Setup button listeners for the copy and feedback buttons
        setupButtonListeners(copyEnabled, feedbackEnabled, class_ai_item, emptyClipboardSVG, checkedClipboardSVG, thumbsUpSVG, thumbsDownSVG, showFeedbackModal, aiBg, fontColor, usrBg, chat, wpaicg_nonce, chatbot_identity);
    
        eventSource.onerror = error => {
            console.log("EventSource failed:", error);
            toggleBlinkingCursor(false);
            wpaicg_ai_thinking.style.display = 'none';
            eventSource.close();
        };
    }

    function processMarkdown(inputText, isStream = false, chatId = null) {
        inputText = inputText !== '' ? inputText.trim() : '';
    
        // Replace new lines
        let formattedText = inputText.replace(/(?:\r\n|\r|\n)/g, '<br>');
    
        // Replace blockquotes
        formattedText = formattedText.replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>');
    
        // Replace unordered lists
        formattedText = formattedText.replace(/^\s*-\s+(.*)$/gm, '<ul><li>$1</li></ul>');
    
        // Replace ordered lists
        formattedText = formattedText.replace(/^\s*\d+\.\s+(.*)$/gm, '<ol><li>$1</li></ol>');
    
        // Replace horizontal rules
        formattedText = formattedText.replace(/^\s*---\s*$/gm, '<hr>');
    
        // Replace bold text
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    
        // Replace italic text
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<i>$1</i>');
    
        // Replace underline text
        formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
    
        // Replace strikethrough text
        formattedText = formattedText.replace(/~~(.*?)~~/g, '<s>$1</s>');
    
        // Replace markdown links (first)
        formattedText = formattedText.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
        // Replace plain URLs (after handling markdown links)
        formattedText = formattedText.replace(/(^|[^"])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank">$2</a>');
    
        // Replace code blocks
        formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
        // Replace inline code
        formattedText = formattedText.replace(/`([\s\S]*?)`/g, '<code>$1</code>');
    
        // If stream mode, update the element with the chatId
        if (isStream && chatId) {
            document.getElementById(chatId).innerHTML = formattedText;
        }
    
        return formattedText;
    }

    // Scroll function to adjust.
    function scrollToAdjust(wpaicg_messages_box) {
        requestAnimationFrame(() => {
            wpaicg_messages_box.scrollTop = wpaicg_messages_box.scrollHeight;
        });
    }
    
    function wpaicgWriteMessage(wpaicg_messages_box,wpaicg_message,wpaicg_randomnum,wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed){
        wpaicg_messages_box.innerHTML += wpaicg_message;
        var wpaicg_current_message = document.getElementById('wpaicg-chat-message-' + wpaicg_randomnum);
        var parentMessage = wpaicg_current_message.parentElement;
        var audio = parentMessage.getElementsByTagName('audio');
        if(audio && audio.length){
            audio[0].play();
        }

        // Apply formatting to the entire response text first
        var formattedText = processMarkdown(wpaicg_response_text);

        if (wpaicg_typewriter_effect) {
            let index = 0; // Starting index of the substring
            function typeWriter() {
                if (index < formattedText.length) {
                    wpaicg_current_message.innerHTML = formattedText.slice(0, index+1);
                    index++;
                    setTimeout(typeWriter, wpaicg_typewriter_speed);
                    //scroll to the latest message if needed
                    scrollToAdjust(wpaicg_messages_box);
                } else {
                    // Once complete, ensure scrolling if needed
                    scrollToAdjust(wpaicg_messages_box);
                }
            }
            typeWriter(); // Start the typewriter effect

        } else {
            wpaicg_current_message.innerHTML = formattedText;
            // Scroll to the latest message if needed
            scrollToAdjust(wpaicg_messages_box);
        }
    }

    function wpaicgMicEvent(mic) {
        if (mic.classList.contains('wpaicg-recording')) {
            mic.innerHTML = '';
            mic.innerHTML = wpaicgMicIcon;
            mic.classList.remove('wpaicg-recording');
            wpaicgstopChatRecording(mic)
        } else {
            let checkRecording = document.querySelectorAll('.wpaicg-recording');
            if (checkRecording && checkRecording.length) {
                alert('Please finish previous recording');
            } else {
                mic.innerHTML = '';
                mic.innerHTML = wpaicgStopIcon;
                mic.classList.add('wpaicg-recording');
                wpaicgstartChatRecording();
            }
        }
    }
    if (wpaicgChatTyping && wpaicgChatTyping.length) {
        for (let i = 0; i < wpaicgChatTyping.length; i++) {
            wpaicgChatTyping[i].addEventListener('keyup', function (event) {
                if ((event.which === 13 || event.keyCode === 13) && !event.shiftKey) {
                    let parentChat = wpaicgChatTyping[i].closest('.wpaicg-chatbox');
                    let chatTyping = parentChat.querySelectorAll('.wpaicg-chatbox-typing')[0];
                    wpaicgSendChatMessage(parentChat, chatTyping, 'widget');
                }
            })
        }
    }
    if (wpaicgShortcodeTyping && wpaicgShortcodeTyping.length) {
        for (let i = 0; i < wpaicgShortcodeTyping.length; i++) {
            wpaicgShortcodeTyping[i].addEventListener('keyup', function (event) {
                if ((event.which === 13 || event.keyCode === 13) && !event.shiftKey) {
                    let parentChat = wpaicgShortcodeTyping[i].closest('.wpaicg-chat-shortcode');
                    let chatTyping = parentChat.querySelectorAll('.wpaicg-chat-shortcode-typing')[0];
                    wpaicgSendChatMessage(parentChat, chatTyping, 'shortcode');
                }
            })
        }
    }
    if (wpaicgChatSend && wpaicgChatSend.length) {
        for (let i = 0; i < wpaicgChatSend.length; i++) {
            wpaicgChatSend[i].addEventListener('click', function (event) {
                let parentChat = wpaicgChatSend[i].closest('.wpaicg-chatbox');
                let chatTyping = parentChat.querySelectorAll('.wpaicg-chatbox-typing')[0];
                wpaicgSendChatMessage(parentChat, chatTyping, 'widget');
            })
        }
    }
    if (wpaicgShortcodeSend && wpaicgShortcodeSend.length) {
        for (let i = 0; i < wpaicgShortcodeSend.length; i++) {
            wpaicgShortcodeSend[i].addEventListener('click', function (event) {
                let parentChat = wpaicgShortcodeSend[i].closest('.wpaicg-chat-shortcode');
                let chatTyping = parentChat.querySelectorAll('.wpaicg-chat-shortcode-typing')[0];
                wpaicgSendChatMessage(parentChat, chatTyping, 'shortcode');
            })
        }
    }

    if (wpaicgMicBtns && wpaicgMicBtns.length) {
        for (let i = 0; i < wpaicgMicBtns.length; i++) {
            wpaicgMicBtns[i].addEventListener('click', function () {
                wpaicgMicEvent(wpaicgMicBtns[i]);
            });
        }
    }
}
wpaicgChatInit();
// Call the init function when the document is ready
document.addEventListener('DOMContentLoaded', loadConversations);
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Recorder = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
        "use strict";

        module.exports = require("./recorder").Recorder;

    },{"./recorder":2}],2:[function(require,module,exports){
        'use strict';

        var _createClass = (function () {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                }
            }return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
            };
        })();

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.Recorder = undefined;

        var _inlineWorker = require('inline-worker');

        var _inlineWorker2 = _interopRequireDefault(_inlineWorker);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
        }

        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }

        var Recorder = exports.Recorder = (function () {
            function Recorder(source, cfg) {
                var _this = this;

                _classCallCheck(this, Recorder);

                this.config = {
                    bufferLen: 4096,
                    numChannels: 2,
                    mimeType: 'audio/wav'
                };
                this.recording = false;
                this.callbacks = {
                    getBuffer: [],
                    exportWAV: []
                };

                Object.assign(this.config, cfg);
                this.context = source.context;
                this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(this.context, this.config.bufferLen, this.config.numChannels, this.config.numChannels);

                this.node.onaudioprocess = function (e) {
                    if (!_this.recording) return;

                    var buffer = [];
                    for (var channel = 0; channel < _this.config.numChannels; channel++) {
                        buffer.push(e.inputBuffer.getChannelData(channel));
                    }
                    _this.worker.postMessage({
                        command: 'record',
                        buffer: buffer
                    });
                };

                source.connect(this.node);
                this.node.connect(this.context.destination); //this should not be necessary

                var self = {};
                this.worker = new _inlineWorker2.default(function () {
                    var recLength = 0,
                        recBuffers = [],
                        sampleRate = undefined,
                        numChannels = undefined;

                    self.onmessage = function (e) {
                        switch (e.data.command) {
                            case 'init':
                                init(e.data.config);
                                break;
                            case 'record':
                                record(e.data.buffer);
                                break;
                            case 'exportWAV':
                                exportWAV(e.data.type);
                                break;
                            case 'getBuffer':
                                getBuffer();
                                break;
                            case 'clear':
                                clear();
                                break;
                        }
                    };

                    function init(config) {
                        sampleRate = config.sampleRate;
                        numChannels = config.numChannels;
                        initBuffers();
                    }

                    function record(inputBuffer) {
                        for (var channel = 0; channel < numChannels; channel++) {
                            recBuffers[channel].push(inputBuffer[channel]);
                        }
                        recLength += inputBuffer[0].length;
                    }

                    function exportWAV(type) {
                        var buffers = [];
                        for (var channel = 0; channel < numChannels; channel++) {
                            buffers.push(mergeBuffers(recBuffers[channel], recLength));
                        }
                        var interleaved = undefined;
                        if (numChannels === 2) {
                            interleaved = interleave(buffers[0], buffers[1]);
                        } else {
                            interleaved = buffers[0];
                        }
                        var dataview = encodeWAV(interleaved);
                        var audioBlob = new Blob([dataview], { type: type });

                        self.postMessage({ command: 'exportWAV', data: audioBlob });
                    }

                    function getBuffer() {
                        var buffers = [];
                        for (var channel = 0; channel < numChannels; channel++) {
                            buffers.push(mergeBuffers(recBuffers[channel], recLength));
                        }
                        self.postMessage({ command: 'getBuffer', data: buffers });
                    }

                    function clear() {
                        recLength = 0;
                        recBuffers = [];
                        initBuffers();
                    }

                    function initBuffers() {
                        for (var channel = 0; channel < numChannels; channel++) {
                            recBuffers[channel] = [];
                        }
                    }

                    function mergeBuffers(recBuffers, recLength) {
                        var result = new Float32Array(recLength);
                        var offset = 0;
                        for (var i = 0; i < recBuffers.length; i++) {
                            result.set(recBuffers[i], offset);
                            offset += recBuffers[i].length;
                        }
                        return result;
                    }

                    function interleave(inputL, inputR) {
                        var length = inputL.length + inputR.length;
                        var result = new Float32Array(length);

                        var index = 0,
                            inputIndex = 0;

                        while (index < length) {
                            result[index++] = inputL[inputIndex];
                            result[index++] = inputR[inputIndex];
                            inputIndex++;
                        }
                        return result;
                    }

                    function floatTo16BitPCM(output, offset, input) {
                        for (var i = 0; i < input.length; i++, offset += 2) {
                            var s = Math.max(-1, Math.min(1, input[i]));
                            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                        }
                    }

                    function writeString(view, offset, string) {
                        for (var i = 0; i < string.length; i++) {
                            view.setUint8(offset + i, string.charCodeAt(i));
                        }
                    }

                    function encodeWAV(samples) {
                        var buffer = new ArrayBuffer(44 + samples.length * 2);
                        var view = new DataView(buffer);

                        /* RIFF identifier */
                        writeString(view, 0, 'RIFF');
                        /* RIFF chunk length */
                        view.setUint32(4, 36 + samples.length * 2, true);
                        /* RIFF type */
                        writeString(view, 8, 'WAVE');
                        /* format chunk identifier */
                        writeString(view, 12, 'fmt ');
                        /* format chunk length */
                        view.setUint32(16, 16, true);
                        /* sample format (raw) */
                        view.setUint16(20, 1, true);
                        /* channel count */
                        view.setUint16(22, numChannels, true);
                        /* sample rate */
                        view.setUint32(24, sampleRate, true);
                        /* byte rate (sample rate * block align) */
                        view.setUint32(28, sampleRate * 4, true);
                        /* block align (channel count * bytes per sample) */
                        view.setUint16(32, numChannels * 2, true);
                        /* bits per sample */
                        view.setUint16(34, 16, true);
                        /* data chunk identifier */
                        writeString(view, 36, 'data');
                        /* data chunk length */
                        view.setUint32(40, samples.length * 2, true);

                        floatTo16BitPCM(view, 44, samples);

                        return view;
                    }
                }, self);

                this.worker.postMessage({
                    command: 'init',
                    config: {
                        sampleRate: this.context.sampleRate,
                        numChannels: this.config.numChannels
                    }
                });

                this.worker.onmessage = function (e) {
                    var cb = _this.callbacks[e.data.command].pop();
                    if (typeof cb == 'function') {
                        cb(e.data.data);
                    }
                };
            }

            _createClass(Recorder, [{
                key: 'record',
                value: function record() {
                    this.recording = true;
                }
            }, {
                key: 'stop',
                value: function stop() {
                    this.recording = false;
                }
            }, {
                key: 'clear',
                value: function clear() {
                    this.worker.postMessage({ command: 'clear' });
                }
            }, {
                key: 'getBuffer',
                value: function getBuffer(cb) {
                    cb = cb || this.config.callback;
                    if (!cb) throw new Error('Callback not set');

                    this.callbacks.getBuffer.push(cb);

                    this.worker.postMessage({ command: 'getBuffer' });
                }
            }, {
                key: 'exportWAV',
                value: function exportWAV(cb, mimeType) {
                    mimeType = mimeType || this.config.mimeType;
                    cb = cb || this.config.callback;
                    if (!cb) throw new Error('Callback not set');

                    this.callbacks.exportWAV.push(cb);

                    this.worker.postMessage({
                        command: 'exportWAV',
                        type: mimeType
                    });
                }
            }], [{
                key: 'forceDownload',
                value: function forceDownload(blob, filename) {
                    var url = (window.URL || window.webkitURL).createObjectURL(blob);
                    var link = window.document.createElement('a');
                    link.href = url;
                    link.download = filename || 'output.wav';
                    var click = document.createEvent("Event");
                    click.initEvent("click", true, true);
                    link.dispatchEvent(click);
                }
            }]);

            return Recorder;
        })();

        exports.default = Recorder;

    },{"inline-worker":3}],3:[function(require,module,exports){
        "use strict";

        module.exports = require("./inline-worker");
    },{"./inline-worker":4}],4:[function(require,module,exports){
        (function (global){
            "use strict";

            var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

            var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            var WORKER_ENABLED = !!(global === global.window && global.URL && global.Blob && global.Worker);

            var InlineWorker = (function () {
                function InlineWorker(func, self) {
                    var _this = this;

                    _classCallCheck(this, InlineWorker);

                    if (WORKER_ENABLED) {
                        var functionBody = func.toString().trim().match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/)[1];
                        var url = global.URL.createObjectURL(new global.Blob([functionBody], { type: "text/javascript" }));

                        return new global.Worker(url);
                    }

                    this.self = self;
                    this.self.postMessage = function (data) {
                        setTimeout(function () {
                            _this.onmessage({ data: data });
                        }, 0);
                    };

                    setTimeout(function () {
                        func.call(self);
                    }, 0);
                }

                _createClass(InlineWorker, {
                    postMessage: {
                        value: function postMessage(data) {
                            var _this = this;

                            setTimeout(function () {
                                _this.self.onmessage({ data: data });
                            }, 0);
                        }
                    }
                });

                return InlineWorker;
            })();

            module.exports = InlineWorker;
        }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    },{}]},{},[1])(1)
});

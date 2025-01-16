document.addEventListener("DOMContentLoaded", function () {
    // Run the function initially
    updateContainerDisplay();
    // Add event listener to check when window is resized
    window.addEventListener('resize', updateContainerDisplay);
    // Run the initialization function when the page loads
    initializePage();
    // Get the draggable element and the drag handles (including handle3 and handle4)
    const mainWindow = document.querySelector('.mainwindow');
    const dragHandles = document.querySelectorAll('#handle1, #handle2, #handle3, #handle4');
    // Add event listeners to drag handles (mouse and touch)
    dragHandles.forEach((handle) => {
        handle.addEventListener('mousedown', startDrag);
        handle.addEventListener('touchstart', startDrag);
        // Add event listeners for dragging (mouse and touch)
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        // Add event listeners to stop dragging (mouse and touch)
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    });
    // Center the window when the page loads
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const windowWidth = mainWindow.offsetWidth;
    const windowHeight = mainWindow.offsetHeight;

    // Calculate the center position
    const left = (viewportWidth - windowWidth) / 2;
    const top = (viewportHeight - windowHeight) / 2;

    // Set the position of the main window
    mainWindow.style.position = 'absolute';
    mainWindow.style.left = `${left}px`;
    mainWindow.style.top = `${top}px`;
    document.addEventListener('contextmenu', event => {
        event.preventDefault();
    });


    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function updateContainerDisplay() {
        const desktopContainer = document.querySelector('.desktopContainer');
        const mobileContainer = document.querySelector('.mobileContainer');
        const errorContainer = document.querySelector('.errorContainer');
        if (window.innerHeight >= 564 && window.innerWidth >= 964) {
            desktopContainer.style.display = 'flex';
            mobileContainer.style.display = 'none';
            errorContainer.style.display = 'none';
        } else {
            if (window.innerHeight >= 420 && window.innerWidth >= 320) {
                desktopContainer.style.display = 'none';
                errorContainer.style.display = 'none';
                mobileContainer.style.display = 'flex';
            } else {
                desktopContainer.style.display = 'none';
                errorContainer.style.display = 'flex';
                mobileContainer.style.display = 'none';
            }
        }
    }

    function addEventListeners(selector, events, callback) {
        events.forEach(event => {
            document.querySelector(selector).addEventListener(event, callback);
        });
    }
    
    // Function to load the JSON and populate the pagecontent div at startup
    async function initializePage() {
        try {
            // Fetch the JSON file
            const response = await fetch('/resources/pages.json');
            const pages = await response.json();

            // Find the "Intro" element in the JSON
            const introPage = pages.find(item => item.name === 'Intro');

            if (introPage) {
                // Find the div with the class 'pagecontent'
                const pageContentDiv = document.querySelector('.pagecontent');
                // Set the content of the 'pagecontent' div to the "html" of the Intro element
                pageContentDiv.innerHTML = introPage.html;
                // Fetch the time on page load
                fetchTimeUTCPlus1();
                // Get days until birthday on page load 
                getDays();
                // Set an interval to fetch the time every 10 seconds
                setInterval(fetchTimeUTCPlus1, 10000);

            } else {
                console.warn('No "Intro" element found in the JSON.');
                document.querySelector('.pagecontent').innerHTML = `<div class="loading">
                <img src="/resources/img/error.jpg">
                Error loading page: no data for Intro found in JSON.
            </div>`;

            }
        } catch (error) {
            console.error('Error initializing the page:', error);
            document.querySelector('.pagecontent').innerHTML = `<div class="loading">
                        <img src="/resources/img/error.jpg">
                        Fatal error during JSON load!
                    </div>`;
        }
    }


    // Utility function to calculate position from both mouse and touch events
    function getEventPosition(event) {
        if (event.touches && event.touches[0]) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
        return { x: event.clientX, y: event.clientY };
    }

    // Start dragging (mouse or touch)
    function startDrag(event) {
        // Only start dragging if the target is one of the drag handles (not children inside the handle)
        if (event.target !== event.currentTarget) {
            return; // If the event is triggered by an element inside the handle, ignore it
        }

        isDragging = true;

        // Prevent default behavior for touch events (to avoid scrolling on touch devices)
        if (event.type === 'touchstart') {
            event.preventDefault();
        }

        const { x, y } = getEventPosition(event);

        // Calculate the offset between the pointer position and the element's position
        const rect = mainWindow.getBoundingClientRect();
        offsetX = x - rect.left;
        offsetY = y - rect.top;

        // Add a visual cue for dragging (optional)
        mainWindow.classList.add('dragging');
    }

    // Perform dragging (mouse or touch)
    function drag(event) {
        if (!isDragging) return;

        const { x, y } = getEventPosition(event);

        // Calculate new position
        const left = x - offsetX;
        const top = y - offsetY;

        // Update the position of the mainWindow
        mainWindow.style.position = 'absolute';
        mainWindow.style.left = `${left}px`;
        mainWindow.style.top = `${top}px`;
    }

    // Stop dragging (mouse or touch)
    function stopDrag() {
        if (!isDragging) return;

        isDragging = false;

        // Remove the visual cue for dragging
        mainWindow.classList.remove('dragging');
    }

});

var currentPageName = 'Intro'
var socialListenersExistence = false;
async function loadPage(pageName) {
    if (pageName === currentPageName) {
        return (1)
    } else {
        // get all category buttons and store them in a const
        const categoryButtons = document.querySelectorAll('button')
        // Remove the "selected" id from all buttons
        categoryButtons.forEach(button => button.removeAttribute('id'));
        // Find the button that called this function (assume it is the button with the pageName as its textContent)
        const activeButton = Array.from(categoryButtons).find(button => button.textContent === pageName);
        // Add the "selected" id to the button that triggered the load
        if (activeButton) {
            activeButton.setAttribute('id', 'selected');
        }
        currentPageName = pageName;
        // set the title to the content of the button
        document.querySelector('.title').textContent = pageName;
        // Check if social's event listeners exist, if they do remove them
        if (socialListenersExistence === true) {
            document.querySelectorAll('.copyable').forEach(element => {
                element.removeEventListener('.copyable', ['click']);
                element.removeEventListener('.copyable', ['touchstart']);
            })
            introListenersExistence = false;
            // console.log("removed");
        }
        try {
            // Fetch the JSON file
            const response = await fetch('/resources/pages.json');
            const pages = await response.json();

            // Find the element in the JSON with the same name as the paragraph content
            const page = pages.find(item => item.name === pageName);

            if (page) {
                // Find the div with the class 'pagecontent'
                const pageContentDiv = document.querySelector('.pagecontent');

                // Set the "html" content from the JSON element to the 'pagecontent' div
                pageContentDiv.innerHTML = page.html;

                //If the loaded page is socials, enable 'copied' notification functionality 

                if (pageName === "Socials") {
                    const handleEvent = (event) => {
                        const clickedElement = event.currentTarget;

                        const copyToClipboard = async (text) => {
                            try {
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                    // Use Clipboard API if available
                                    await navigator.clipboard.writeText(text);
                                    console.log("Copied to clipboard:", text);

                                    // Handle success notification
                                    const notification = document.querySelector('.notification');
                                    if (notification) {
                                        notification.classList.add('activated');

                                        // Remove the 'activated' class after 1.5 seconds
                                        setTimeout(() => {
                                            notification.classList.remove('activated');
                                        }, 1500);
                                    }
                                } else {
                                    throw new Error("Clipboard API not supported");
                                }
                            } catch (err) {
                                console.error("Failed to copy text to clipboard:", err);

                                // Handle failure notification
                                const notificationFail = document.querySelector('.notificationFail');
                                if (notificationFail) {
                                    notificationFail.classList.add('activated');

                                    // Remove the 'activated' class after 1.5 seconds
                                    setTimeout(() => {
                                        notificationFail.classList.remove('activated');
                                    }, 1500);
                                }
                            }
                        };

                        if (clickedElement.id === 'discord') {
                            copyToClipboard("advexed");
                        } else if (clickedElement.id === 'switch') {
                            copyToClipboard("SW-1081-1415-2930");
                        }
                    };
                    // Function to handle the event
                    const handleEvent2 = (event) => {
                        event.preventDefault();
                        const clickedElement = event.currentTarget;

                        // Check the ID of the clicked element
                        if (clickedElement.id === 'gddl') {
                            window.open("https://gdladder.com/profile/5357", '_blank').focus();
                        } else if (clickedElement.id === 'tiktok') {
                            window.open("https://www.tiktok.com/@advexed/", '_blank').focus();
                        } else if (clickedElement.id === 'gd') {
                            window.open("https://gdbrowser.com/u/advexed", '_blank').focus();
                        } else if (clickedElement.id === 'twitter') {
                            window.open("https://x.com/advexedd", '_blank').focus();
                        } else if (clickedElement.id === 'youtube') {
                            window.open("https://www.youtube.com/channel/UCwBZBaq6hdQdbYx9vuvWQyQ", '_blank').focus();
                        } else if (clickedElement.id === 'lastfm') {
                            window.open("https://www.last.fm/user/advexed", '_blank').focus();
                        }
                    };

                    // Add event listeners to all elements with the class 'clickable'
                    document.querySelectorAll('.clickable').forEach(element => {
                        element.addEventListener('click', handleEvent2);
                        element.addEventListener('touchstart', handleEvent2);
                    });

                    // Add both click and touchstart event listeners to elements with the 'copyable' class
                    document.querySelectorAll('.copyable').forEach(element => {
                        element.addEventListener('click', handleEvent);
                        element.addEventListener('touchstart', handleEvent);
                    });
                }

                // Check if "necessaryFunctions" exists in the JSON element
                if (page.necessaryFunctions && Array.isArray(page.necessaryFunctions)) {
                    page.necessaryFunctions.forEach(funcName => {
                        // Check if the function is defined and callable
                        if (typeof window[funcName] === 'function') {
                            try {
                                // Call the function
                                window[funcName]();
                            } catch (funcError) {
                                console.error(`Error executing function '${funcName}':`, funcError);
                            }
                        } else {
                            console.warn(`Function '${funcName}' is not defined or not callable.`);
                        }
                    });
                }
            } else {
                console.warn('No matching page found in the JSON for:', pageName);
                document.querySelector('.pagecontent').innerHTML = `<div class="loading">
            <img src="/resources/img/error.png">
            Error loading page: no matching data found in JSON.
        </div>`;
            }
        } catch (error) {
            console.error('Error fetching or processing the JSON file:', error);
            document.querySelector('.pagecontent').innerHTML = `<div class="loading">
                    <img src="/resources/img/error.png">
                    Fatal error during JSON load!
                </div>`;
        }
    }
}
// get remaining days until birthday 
function getDays() {
    if (typeof today !== 'undefined') {
        // date already exists in ram, only thing thats left to do is to append it 
        countdownElement.textContent = daysLeft + " days";
    } else {
        // Get today's date
        const today = new Date();

        // Get the current year
        const currentYear = today.getFullYear();

        // Set the target date (April 9th of the current year)
        let targetDate = new Date(currentYear, 3, 9); // Month is 0-based (3 = April)

        // If today's date is after April 9th, set the target date to April 9th of the next year
        if (today > targetDate) {
            targetDate = new Date(currentYear + 1, 3, 9);
        }

        // Calculate the difference in time (in milliseconds)
        const timeDifference = targetDate - today;

        // Convert time difference from milliseconds to days
        const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        // Append the number of days left to the '.countdown' element
        const countdownElement = document.querySelector('.countdown');
        countdownElement.textContent = daysLeft + " days";
    }
}
// get current time for utc+1
function fetchTimeUTCPlus1() {
    const now = new Date();
    // Calculate UTC+1 time by adding 1 hour to UTC time
    const utcPlus1 = new Date(now.getTime() + (1 * 60 * 60 * 1000));

    // Format the time as HH:MM
    const hours = utcPlus1.getUTCHours();
    const minutes = utcPlus1.getUTCMinutes();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Update the content of .time
    const timeElement = document.querySelector('.time');
    if (timeElement) {
        timeElement.textContent = `${formattedTime}`;
    }
}

function submitForm (){
    document.querySelector('.blocker').style.display = 'block';
} 
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const promptArea = document.getElementById('prompt-area');
    const toggleSidebarButton = document.getElementById('toggle-sidebar');
    const togglePromptsButton = document.getElementById('toggle-prompts');
    const appletIframe = document.getElementById('applet-iframe');
    const promptIframe = document.getElementById('prompt-iframe');
    const appletLinks = document.querySelectorAll('#applet-list .applet-link');
    const currentYearSpan = document.getElementById('current-year');

    // Set Current Year in Footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Toggle Sidebar ---
    if (toggleSidebarButton && sidebar) {
        toggleSidebarButton.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-hidden');
            // Optional: Change button text/icon based on state
            // toggleSidebarButton.textContent = document.body.classList.contains('sidebar-hidden') ? '›' : '‹';
        });
    }

    // --- Toggle Prompts Area ---
    if (togglePromptsButton && promptArea) {
        togglePromptsButton.addEventListener('click', () => {
            document.body.classList.toggle('prompts-hidden');
            // Optional: Change button text/icon based on state
            // togglePromptsButton.textContent = document.body.classList.contains('prompts-hidden') ? '⌃' : '⌄';
        });
    }

    // --- Applet Loading ---
    if (appletIframe && promptIframe && appletLinks.length > 0) {
        appletLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default link navigation

                // Get file paths from data attributes
                const appletSrc = link.getAttribute('data-applet-src');
                const promptSrc = link.getAttribute('data-prompt-src');

                // ****** MODIFY HERE: Add logic if paths are missing ******
                if (!appletSrc) {
                    console.error("Applet source not specified for link:", link.textContent);
                    // Maybe load a default "not found" page?
                    // appletIframe.src = 'applets/not_found.html';
                    return; // Stop processing if no applet source
                }

                 // Load the new applet
                appletIframe.src = appletSrc;

                // Load the corresponding prompts file (or a default if none specified)
                promptIframe.src = promptSrc || 'prompts/default_prompts.txt'; // Fallback to default

                // Update active link styling
                appletLinks.forEach(otherLink => otherLink.classList.remove('active'));
                link.classList.add('active');

                // Optional: Close sidebar on mobile after selection?
                // if (window.innerWidth < 768) {
                //    document.body.classList.add('sidebar-hidden');
                //}
            });
        });

        // Set initial active state based on the first link (or iframe src)
        // This assumes the first link corresponds to the initial iframe src
        const initialActiveLink = document.querySelector('.applet-link[data-applet-src="' + appletIframe.getAttribute('src') + '"]');
        if (initialActiveLink) {
             appletLinks.forEach(otherLink => otherLink.classList.remove('active'));
             initialActiveLink.classList.add('active');
        } else if (appletLinks.length > 0) {
            // Fallback: Make the first link active if no match found
             appletLinks.forEach(otherLink => otherLink.classList.remove('active'));
             appletLinks[0].classList.add('active');
        }

    } else {
        console.warn("Required elements for applet loading (iframes, links) not found.");
    }

});
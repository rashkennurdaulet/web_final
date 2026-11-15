/* Assignment 6: jQuery interactions for City Zoo. */
(function ($) {
    'use strict';

    if (!$) return;

    $(document).ready(function () {
        console.log('jQuery is ready!');

        var $body = $('body');
        var $progress = $('<div class="scroll-progress" aria-hidden="true"><span></span></div>');
        var $toast = $('<div class="zoo-toast" role="status" aria-live="polite"></div>');
        $body.prepend($progress).append($toast);

        function updateProgress() {
            var scrollable = $(document).height() - $(window).height();
            var percent = scrollable > 0 ? ($(window).scrollTop() / scrollable) * 100 : 0;
            $progress.find('span').css('width', Math.min(100, Math.max(0, percent)) + '%');
        }
        $(window).on('scroll.jqueryAssignment resize.jqueryAssignment', updateProgress);
        updateProgress();

        var toastTimer;
        function showToast(message) {
            window.clearTimeout(toastTimer);
            $toast.stop(true, true).text(message).addClass('is-visible');
            toastTimer = window.setTimeout(function () {
                $toast.removeClass('is-visible');
            }, 2600);
        }
        window.ZooToast = showToast;

        // Reuse the existing animal search. Other pages receive the same search UI.
        var $search = $('#animal-search');
        var isAnimalSearch = $search.length > 0;
        var $inlineSlot = $('#main > [data-inline-search]');
        var $inlineResults = $();
        if (!isAnimalSearch && $('#main:not([data-account-page], [data-no-page-search]):not(:has(#register-form))').length) {
            var searchMarkup = '<section class="zoo-search mb-4" aria-label="Search City Zoo content">' +
                '<label class="form-label fw-semibold" for="zoo-search-input">Explore the zoo</label>' +
                '<div class="zoo-search-wrap"><input class="form-control" id="zoo-search-input" type="search" autocomplete="off" placeholder="Search this page…" aria-autocomplete="list" aria-controls="zoo-search-suggestions">' +
                '<ul class="zoo-search-suggestions" id="zoo-search-suggestions" role="listbox" hidden></ul></div>' +
                '<p class="small text-body-secondary mt-2 mb-0" id="zoo-search-status" aria-live="polite">Search this page as you type.</p></section>';
            var $firstHeading = $('#main').find('h1').first();
            if ($inlineSlot.length) {
                var label = $inlineSlot.attr('data-inline-search');
                $inlineSlot.replaceWith(searchMarkup);
                if (label) {
                    $('label[for="zoo-search-input"]').text(label);
                    $('#zoo-search-input').attr('placeholder', 'Search ticket passes…');
                }
                $inlineResults = $('<div class="zoo-search-results" id="zoo-search-results" role="region" aria-label="Search results" hidden></div>');
                $inlineResults.insertAfter('#zoo-search-status');
            } else if ($firstHeading.length) $firstHeading.parent().after(searchMarkup);
            else $('#main').prepend(searchMarkup);
            $search = $('#zoo-search-input');
        } else if (isAnimalSearch) {
            $search.attr({ 'aria-autocomplete': 'list', 'aria-controls': 'animal-search-suggestions' });
            $('<ul class="zoo-search-suggestions" id="animal-search-suggestions" role="listbox" hidden></ul>').insertAfter($search);
        }

        if ($search.length) {
            var $suggestions = $search.siblings('.zoo-search-suggestions');
            var $status = isAnimalSearch ? $('#animal-count') : $('#zoo-search-status');
            if ($inlineResults.length) {
                $suggestions.remove();
                $search.removeAttr('aria-autocomplete').attr('aria-controls', 'zoo-search-results');
            }
            // Never search inside the booking form: it must keep its own buttons and typed values.
            var $targets = isAnimalSearch ? $('.animal-col') : $('#main').find('.card-zoo, .faq-item, .why-visit-card, .list-group-item, article').not('form, #wizard-success, :has(form)');
            // Keep only the outermost blocks, so a card and the list items inside it are not counted twice.
            $targets = $targets.filter(function () { return !$(this).parent().closest($targets).length; });
            // Keep the original elements and their event handlers when results move.
            var originalPositions = new Map();
            if ($inlineResults.length) {
                $targets.each(function () {
                    var position = document.createComment('search result position');
                    this.before(position);
                    originalPositions.set(this, position);
                });
            }

            function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

            // IMPORTANT: highlighting must only wrap text nodes in <mark>. Re-writing innerHTML would
            // destroy every event listener inside the block (FAQ accordion, star rating, fact button...).
            function clearHighlights(root) {
                $(root).find('mark.search-highlight').each(function () {
                    this.parentNode.replaceChild(document.createTextNode(this.textContent), this);
                });
                root.normalize();
            }
            function highlightText(root, query) {
                var pattern = new RegExp(escapeRegExp(query), 'ig');
                var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                    acceptNode: function (node) {
                        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                        return /^(SCRIPT|STYLE|MARK)$/.test(node.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
                    }
                });
                var nodes = [];
                while (walker.nextNode()) nodes.push(walker.currentNode);
                nodes.forEach(function (node) {
                    var text = node.nodeValue, last = 0, found, fragment = document.createDocumentFragment();
                    pattern.lastIndex = 0;
                    while ((found = pattern.exec(text)) !== null) {
                        if (found.index > last) fragment.appendChild(document.createTextNode(text.slice(last, found.index)));
                        var mark = document.createElement('mark');
                        mark.className = 'search-highlight';
                        mark.textContent = found[0];
                        fragment.appendChild(mark);
                        last = found.index + found[0].length;
                    }
                    if (!last) return;                       // no match in this text node
                    if (last < text.length) fragment.appendChild(document.createTextNode(text.slice(last)));
                    node.parentNode.replaceChild(fragment, node);
                });
            }

            function applySearch() {
                var query = String($search.val() || '').trim();
                var normalized = query.toLocaleLowerCase();
                var matched = 0;
                var inlineResults = document.createDocumentFragment();

                $targets.each(function () {
                    var $item = $(this);
                    clearHighlights(this);
                    var isMatch = isAnimalSearch
                        ? !$item.hasClass('d-none')
                        : (this.textContent || '').replace(/\s+/g, ' ').toLocaleLowerCase().includes(normalized);
                    if ($inlineResults.length) {
                        if (normalized && isMatch) inlineResults.append(this);
                        else if (this.parentElement === $inlineResults[0]) originalPositions.get(this).after(this);
                    } else if (!isAnimalSearch) {
                        $item.toggle(isMatch);
                    }
                    if (isMatch) matched++;
                    if (isMatch && query) highlightText(this, query);
                });
                if ($inlineResults.length) {
                    $inlineResults[0].append(inlineResults);
                    $inlineResults.prop('hidden', !normalized || !matched);
                }

                // On the Animals page js/animals.js owns the "Showing X of Y" counter (it also knows the
                // selected category); writing it here as well made the number wrong.
                if (!isAnimalSearch) {
                    if (query) $status.text(matched ? matched + ' matching result' + (matched === 1 ? '' : 's') : 'No matching results. Try another keyword.');
                    else $status.text('Search this page as you type.');
                }
                // Hidden/shown blocks change the page height; let open FAQ panels and the scroll bar re-measure.
                window.dispatchEvent(new Event('resize'));
                if ($inlineResults.length) return;

                var names = [];
                $targets.each(function () {
                    if ($(this).is(':visible')) {
                        var title = $(this).find('.card-title, .faq-question span:first-child, h2, h3').first().text().trim();
                        if (title && names.indexOf(title) < 0) names.push(title);
                    }
                });
                var matches = normalized ? names.filter(function (name) { return name.toLocaleLowerCase().indexOf(normalized) >= 0; }).slice(0, 6) : [];
                $suggestions.empty();
                matches.forEach(function (name, index) {
                    $('<li role="option"></li>').append($('<button type="button" class="zoo-suggestion"></button>').text(name).attr('data-index', index)).appendTo($suggestions);
                });
                $suggestions.prop('hidden', matches.length === 0 || document.activeElement !== $search[0]);
            }

            if (!$inlineResults.length) $search.on('focus.jqueryAssignment', applySearch);
            if (isAnimalSearch) document.addEventListener('zoo:animal-filter', applySearch);
            else $search.on('input.jqueryAssignment', applySearch);
            $suggestions.on('click', '.zoo-suggestion', function () {
                $search.val($(this).text());
                $search[0].dispatchEvent(new Event('input', { bubbles: true }));
                $search[0].focus();
                $suggestions.prop('hidden', true);
            });
            if (!$inlineResults.length) $search.add($suggestions).on('focusout.jqueryAssignment', function (event) {
                if (event.relatedTarget !== $search[0] && !$.contains($suggestions[0], event.relatedTarget)) {
                    $suggestions.prop('hidden', true);
                }
            });
            if (!$inlineResults.length) $search.on('keydown.jqueryAssignment', function (event) {
                if (event.key === 'Escape') $suggestions.prop('hidden', true);
                if (event.key === 'ArrowDown' && !$suggestions.prop('hidden')) {
                    event.preventDefault();
                    $suggestions.find('button').first().trigger('focus');
                }
            });
            $suggestions.on('keydown.jqueryAssignment', 'button', function (event) {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $(this).trigger('click'); }
                if (event.key === 'Escape') { $suggestions.prop('hidden', true); $search.trigger('focus'); }
            });
            applySearch();
        }

        // Animate statistic values once when the stats enter the viewport.
        $('[data-counter]').each(function () {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            var $counter = $(this);
            var target = Number($counter.attr('data-counter')) || 0;
            var suffix = $counter.attr('data-counter-suffix') || '';
            var started = false;
            var observer = new IntersectionObserver(function (entries) {
                if (!entries[0].isIntersecting || started) return;
                started = true;
                $({ value: 0 }).animate({ value: target }, {
                    duration: 1400,
                    easing: 'swing',
                    step: function () { $counter.text(Math.floor(this.value).toLocaleString() + suffix); },
                    complete: function () { $counter.text(target.toLocaleString() + suffix); }
                });
                observer.disconnect();
            }, { threshold: 0.35 });
            observer.observe(this);
        });

        // Called only after the site's existing validation accepts the form.
        window.ZooSubmitFeedback = function (form, onComplete) {
            var $form = $(form);
            var $button = $form.find('[type="submit"]').first();
            if (!$button.length || $button.prop('disabled')) return;
            var label = $button.html();
            $button.prop('disabled', true).attr('aria-busy', 'true').html('<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait…');
            window.setTimeout(function () {
                $button.prop('disabled', false).removeAttr('aria-busy').html(label);
                if (typeof onComplete === 'function') onComplete();
                else showToast('Form saved in this browser.');
            }, 1400);
        };

        // Copy the chosen text and confirm the action with a checkmark and toast.
        $(document).on('click.jqueryAssignment', '[data-copy-target]', function () {
            var $button = $(this);
            var target = document.getElementById($button.attr('data-copy-target'));
            if (!target) return;
            var value = target.innerText.trim();
            function copied() {
                var old = $button.html();
                $button.html('<span aria-hidden="true">✓</span> Copied!').addClass('is-copied');
                showToast('Copied to clipboard!');
                window.setTimeout(function () { $button.html(old).removeClass('is-copied'); }, 2000);
            }
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(value).then(copied).catch(function () { fallbackCopy(value, copied); });
            } else fallbackCopy(value, copied);
        });
        function fallbackCopy(value, done) {
            var $temporary = $('<textarea>').val(value).css({ position: 'fixed', opacity: 0 }).appendTo('body').trigger('focus').trigger('select');
            try { if (document.execCommand('copy')) done(); else showToast('Clipboard access is unavailable in this browser.'); }
            catch (error) { showToast('Clipboard access is unavailable in this browser.'); }
            $temporary.remove();
        }

        $('img[loading="lazy"]').one('load', function () {
            $(this).addClass('is-loaded');
        });
    });
})(window.jQuery);


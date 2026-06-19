# Install

## HACS Custom Repository

1. Open HACS.
2. Open the three-dot menu.
3. Choose Custom repositories.
4. Add:

```text
RoBro92/HACS-ai-usage-banner-card
```

5. Set the category to Dashboard.
6. Install AI Usage Banner Card.
7. Hard refresh Home Assistant.

The resource should resolve to:

```yaml
url: /hacsfiles/HACS-ai-usage-banner-card/HACS-ai-usage-banner-card.js
type: module
```

## Manual Install

Copy `dist/HACS-ai-usage-banner-card.js` to Home Assistant under:

```text
/config/www/community/HACS-ai-usage-banner-card/HACS-ai-usage-banner-card.js
```

Then add a dashboard resource:

```yaml
url: /local/community/HACS-ai-usage-banner-card/HACS-ai-usage-banner-card.js
type: module
```

Hard refresh the browser after adding or updating the resource.

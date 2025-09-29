/**
 * GeneticsTreeVisualizer - A dynamic D3-based strain genetics tree visualizer
 * Pulls data from window.siteConfig instead of hardcoded values
 */

class GeneticsTreeVisualizer {
    constructor(options = {}) {
        // Configuration
        this.config = {
            treeElementId: options.treeElementId || 'genetics-tree',
            strainDescriptionId: options.strainDescriptionId || 'strain-description',
            expandAllId: options.expandAllId || 'expand-all',
            collapseAllId: options.collapseAllId || 'collapse-all'
        };
        
        // D3 visualization variables
        this.i = 0; // Counter for ID generation
        this.root = null; // Root of the tree data
        this.svg = null; // SVG element for the tree
        this.treemap = null; // D3 tree layout
        this.strainDescriptions = {}; // Object mapping strain names to descriptions
        
        // Initialize the visualizer
        this.init();
    }
    
    async init() {
        try {
            // Build strain data from config
            this.buildStrainDataFromConfig();
            
            // Initialize visualization
            this.initializeVisualization();
            
            // Setup event listeners
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing GeneticsTreeVisualizer:', error);
        }
    }
    
    buildStrainDataFromConfig() {
        try {
            const siteConfig = window.siteConfig;
            
            if (!siteConfig || !siteConfig.products || !siteConfig.products.items) {
                console.error('Site config not found or invalid');
                this.strainTree = { name: "Error", children: [] };
                return;
            }
            
            const products = siteConfig.products.items;
            const siteName = siteConfig.site.name || "Genetics Collection";
            
            // Filter for visible physical products (seeds)
            const visibleSeeds = Object.values(products).filter(product => 
                product.delivery === 'physical' && 
                !product.hidden &&
                product.type // Has a collection type
            );
            
            // Group by collection type
            const collections = {};
            visibleSeeds.forEach(seed => {
                const collection = seed.type;
                if (!collections[collection]) {
                    collections[collection] = [];
                }
                collections[collection].push(seed);
            });
            
            // Build tree structure
            const children = Object.keys(collections).map(collectionName => ({
                name: collectionName,
                children: collections[collectionName].map(seed => ({
                    name: seed.name,
                    children: []
                }))
            }));
            
            // Create the root tree structure
            this.strainTree = {
                name: siteName,
                children: children
            };
            
            // Build descriptions from product data
            this.strainDescriptions = {};
            visibleSeeds.forEach(seed => {
                // Combine description and details for a comprehensive view
                let fullDescription = seed.description || '';
                if (seed.details) {
                    fullDescription += `<br><br><strong>Details:</strong><br>${seed.details.replace(/\n/g, '<br>')}`;
                }
                if (seed.notes) {
                    fullDescription += `<br><br><strong>Notes:</strong> ${seed.notes}`;
                }
                this.strainDescriptions[seed.name] = fullDescription;
            });
            
            // Store collection descriptions
            this.collectionDescriptions = siteConfig.strainTree?.collectionDescriptions || {};
            
        } catch (error) {
            console.error('Error building strain data from config:', error);
            this.strainTree = { name: "Error", children: [] };
        }
    }
    
    initializeVisualization() {
        const treeElement = document.getElementById(this.config.treeElementId);
        
        // If no tree element or strainTree data is available
        if (!treeElement || !this.strainTree || !this.strainTree.name) {
            if (treeElement) {
                treeElement.innerHTML = '<p class="error-message">Error loading genetics tree data</p>';
            }
            return;
        }
        
        // D3.js Tree Visualization
        const width = treeElement.clientWidth;
        const height = 400;
        const isMobile = window.innerWidth <= 768;
        const margin = isMobile 
            ? {top: 20, right: 20, bottom: 20, left: 20} 
            : {top: 20, right: 90, bottom: 20, left: 90};
        
        // Clear any existing SVG
        d3.select(`#${this.config.treeElementId}`).select('svg').remove();
        
        // Create SVG
        this.svg = d3.select(`#${this.config.treeElementId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Create tree layout
        this.treemap = d3.tree()
            .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
            .separation((a, b) => {
                const visibleNodes = this.root ? this.root.descendants().filter(d => !d._children).length : 0;
                const baseSpacing = visibleNodes > 8 ? 1.8 : 1.2;
                return a.parent == b.parent ? baseSpacing : baseSpacing + 0.3;
            });
        
        // Prepare data
        this.root = d3.hierarchy(this.strainTree);
        this.root.x0 = height / 2;
        this.root.y0 = isMobile ? -100 : 0;
        
        // Load saved state or default to expanded
        const savedState = localStorage.getItem('genetics-tree-state');
        if (savedState) {
            this.applySavedState(JSON.parse(savedState));
        }
        
        // Start the visualization
        this.update(this.root);
    }
    
    collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(child => this.collapse(child));
            d.children = null;
        }
    }
    
    update(source) {
        try {
            // Assigns the x and y position for the nodes
            const treeData = this.treemap(this.root);
            
            // Get the nodes and links from the hierarchy
            const nodes = treeData.descendants();
            const links = treeData.descendants().slice(1);
            
            // Normalize for fixed-depth and center the tree
            nodes.forEach(d => {
                d.y = d.depth * 230 + 50; // Add offset to center tree
            });
            
            // ****************** Nodes section ***************************
            
            // Update the nodes...
            const node = this.svg.selectAll('g.node')
                .data(nodes, d => d.id || (d.id = ++this.i));
            
            // Enter any new nodes at the parent's previous position
            const nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr('transform', d => `translate(${source.y0},${source.x0})`)
                .on('click', (event, d) => this.click(event, d));
                
            // Add labels for the nodes FIRST
            const textElements = nodeEnter.append('text')
                .attr('dy', '.35em')
                .attr('x', 0)
                .attr('text-anchor', 'start')
                .text(d => d.data.name)
                .style('font-size', '12px')
                .style('fill', '#f5f0e6')
                .attr('cursor', 'pointer');

            // Add bubble/pill background AFTER text, sized to fit
            nodeEnter.insert('rect', 'text')
                .attr('class', 'node-bubble')
                .attr('rx', 12)
                .attr('ry', 12)
                .attr('y', -15)
                .attr('height', 30)
                .attr('cursor', 'pointer')
                .each(function(d) {
                    const textWidth = this.nextSibling.getBBox().width;
                    d3.select(this)
                        .attr('x', -20)
                        .attr('width', textWidth + 40);
                })
                .style('fill', d => d._children ? '#c69c6d' : '#b87333')
                .style('stroke', '#b87333')
                .style('stroke-width', 2);
            
            // UPDATE
            const nodeUpdate = nodeEnter.merge(node);
            
            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(750)
                .attr('transform', d => `translate(${d.y},${d.x})`);
            
            // Update the node attributes and style
            nodeUpdate.select('rect.node-bubble')
                .each(function(d) {
                    const textEl = d3.select(this.parentNode).select('text').node();
                    if (textEl) {
                        const textWidth = textEl.getBBox().width;
                        d3.select(this)
                            .attr('x', -20)
                            .attr('width', textWidth + 40);
                    }
                })
                .style('fill', d => d._children ? '#c69c6d' : '#b87333');
            
            // Remove any exiting nodes
            const nodeExit = node.exit().transition()
                .duration(750)
                .attr('transform', d => `translate(${source.y},${source.x})`)
                .remove();
            
            // On exit reduce the bubble opacity
            nodeExit.select('rect.node-bubble')
                .attr('fill-opacity', 1e-6);
            
            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);
            
            // ****************** links section ***************************
            
            // Update the links...
            const link = this.svg.selectAll('path.link')
                .data(links, d => d.id);
            
            // Enter any new links at the parent's previous position
            const linkEnter = link.enter().insert('path', 'g')
                .attr('class', 'link')
                .attr('d', d => {
                    const o = {x: source.x0, y: source.y0};
                    return this.diagonal(o, o);
                })
                .style('fill', 'none')
                .style('stroke', '#c69c6d')
                .style('stroke-width', 2);
            
            // UPDATE
            const linkUpdate = linkEnter.merge(link);
            
            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(750)
                .attr('d', d => this.diagonal(d, d.parent));
            
            // Remove any exiting links
            link.exit().transition()
                .duration(750)
                .attr('d', d => {
                    const o = {x: source.x, y: source.y};
                    return this.diagonal(o, o);
                })
                .remove();
            
            // Store the old positions for transition
            nodes.forEach(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
            
            // Show default description when tree loads
            const strainDescriptionEl = document.getElementById(this.config.strainDescriptionId);
            if (strainDescriptionEl && source === this.root) {
                const siteName = window.siteConfig?.site?.name || "Genetics Collection";
                const defaultDescription = this.collectionDescriptions[siteName] || 
                    `Welcome to ${siteName}. Click on collections to explore our genetics.`;
                strainDescriptionEl.innerHTML = `<strong>${siteName}</strong><br><br>${defaultDescription}`;
            }
        } catch (error) {
            console.error("Error in update function:", error);
        }
    }
    
    diagonal(s, d) {
        return `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
    }
    
    click(event, d) {
        try {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            
            // Update the tree
            this.update(d);
            
            // Save the tree state
            this.saveTreeState();
            
            // Find the strain data to display more information
            const strainName = d.data.name;
            const strainDescriptionEl = document.getElementById(this.config.strainDescriptionId);
            
            if (!strainDescriptionEl) return;
            
            // Check if this is a collection node or a strain node
            if (d.children || d._children) {
                // This is a collection node
                const description = this.collectionDescriptions[strainName] || 
                    `${strainName} - Expand to view individual strains.`;
                
                strainDescriptionEl.innerHTML = `<strong>${strainName}</strong><br><br>${description}`;
                return;
            }
            
            // This is a strain node - use the description from our strainDescriptions object
            const description = this.strainDescriptions[strainName];
            
            if (description) {
                strainDescriptionEl.innerHTML = `<strong>${strainName}</strong><br><br>${description}`;
            } else {
                strainDescriptionEl.innerText = "No information available for this strain.";
            }
        } catch (error) {
            console.error("Error in click handler:", error);
        }
    }
    
    expandAll() {
        if (this.root) {
            this.expandAllNodes(this.root);
            this.update(this.root);
            this.saveTreeState();
        }
    }
    
    expandAllNodes(d) {
        if (d._children) {
            d.children = d._children;
            d._children = null;
            d.children.forEach(child => this.expandAllNodes(child));
        } else if (d.children) {
            d.children.forEach(child => this.expandAllNodes(child));
        }
    }
    
    collapseAll() {
        if (this.root && this.root.children) {
            this.root.children.forEach(child => this.collapse(child));
            this.update(this.root);
            this.saveTreeState();
        }
    }
    
    setupEventListeners() {
        // Expand all button
        const expandAllBtn = document.getElementById(this.config.expandAllId);
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.expandAll();
            });
        }
        
        // Collapse all button
        const collapseAllBtn = document.getElementById(this.config.collapseAllId);
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.collapseAll();
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            // Debounce the resize event
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.initializeVisualization();
            }, 250);
        });
    }
    
    saveTreeState() {
        const state = this.getNodeState(this.root);
        localStorage.setItem('genetics-tree-state', JSON.stringify(state));
    }

    getNodeState(node) {
        return {
            name: node.data.name,
            collapsed: !!node._children,
            children: node.children ? node.children.map(child => this.getNodeState(child)) : []
        };
    }

    applySavedState(state) {
        this.applyStateToNode(this.root, state);
    }

    applyStateToNode(node, state) {
        if (state.collapsed && node.children) {
            node._children = node.children;
            node.children = null;
        }
        // Apply to children if they exist
        if (node.children && state.children) {
            node.children.forEach((child, i) => {
                if (state.children[i]) {
                    this.applyStateToNode(child, state.children[i]);
                }
            });
        }
    }
}

// Export the GeneticsTreeVisualizer class
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = GeneticsTreeVisualizer;
} else {
    window.GeneticsTreeVisualizer = GeneticsTreeVisualizer;
}
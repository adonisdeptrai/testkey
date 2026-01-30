const products = [
    {
        id: 1,
        name: "Blade of Infinite Sorrow",
        type: "Weapon",
        rarity: "legendary",
        price: 4500,
        currency: "gem",
        image: "https://cdn-icons-png.flaticon.com/512/3246/3246473.png" // Placeholder sword icon
    },
    {
        id: 2,
        name: "Abyssal Chestplate",
        type: "Armor",
        rarity: "epic",
        price: 2800,
        currency: "gem",
        image: "https://cdn-icons-png.flaticon.com/512/2666/2666324.png" // Placeholder armor icon
    },
    {
        id: 3,
        name: "Potion of Void Sight",
        type: "Artifact",
        rarity: "rare",
        price: 500,
        currency: "coin",
        image: "https://cdn-icons-png.flaticon.com/512/867/867904.png" // Placeholder potion
    },
    {
        id: 4,
        name: "Crystal Dragon Egg",
        type: "Artifact",
        rarity: "legendary",
        price: 12000,
        currency: "gem",
        image: "https://cdn-icons-png.flaticon.com/512/1009/1009953.png" // Placeholder egg
    },
    {
        id: 5,
        name: "Gauntlets of Fury",
        type: "Armor",
        rarity: "rare",
        price: 1500,
        currency: "coin",
        image: "https://cdn-icons-png.flaticon.com/512/3061/3061732.png" // Placeholder gloves
    },
    {
        id: 6,
        name: "Staff of the Ancients",
        type: "Weapon",
        rarity: "epic",
        price: 3200,
        currency: "gem",
        image: "https://cdn-icons-png.flaticon.com/512/1066/1066347.png" // Placeholder staff
    }
];

const grid = document.getElementById('products-grid');

function renderProducts(filter = 'All') {
    grid.innerHTML = '';
    
    const filtered = filter === 'All' 
        ? products 
        : products.filter(p => p.type === filter || p.type.includes(filter));

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const currencyIcon = product.currency === 'gem' 
            ? '<i class="ri-vip-diamond-fill" style="color: #d000ff"></i>' 
            : '<i class="ri-copper-coin-fill" style="color: #ffaa00"></i>';

        card.innerHTML = `
            <span class="rarity-badge rarity-${product.rarity}">${product.rarity}</span>
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.type}</p>
                <div class="price-row">
                    <div class="price">
                        ${currencyIcon} ${product.price.toLocaleString()}
                    </div>
                    <button class="add-btn"><i class="ri-add-line"></i></button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Initial Render
renderProducts();

// Filter Logic
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderProducts(e.target.innerText);
    });
});

// 3D Tilt Effect on Cards
document.addEventListener('mousemove', (e) => {
    // Subtle parallax for background blobs based on mouse movement
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    document.querySelector('.blob-1').style.transform = `translate(${x * 30}px, ${y * 30}px)`;
    document.querySelector('.blob-2').style.transform = `translate(${-x * 30}px, ${-y * 30}px)`;
});

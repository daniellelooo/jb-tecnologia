-- ============================================================
-- IMÁGENES REALES DE PRODUCTOS (Wikimedia Commons)
-- ============================================================
-- Reemplaza las imágenes genéricas (1 por categoría) con fotos
-- reales y variadas de productos similares. URLs vía Special:FilePath
-- que es estable y libre de derechos.
-- ============================================================

-- Helper: usar Special:FilePath para que la URL siempre resuelva,
-- aunque Wikimedia mueva el archivo internamente.
-- Patrón: https://commons.wikimedia.org/wiki/Special:FilePath/{file}?width=800

-- ============================================================
-- CPUs (8)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Intel_core_i5-2467m_sr0d6.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'intel-core-i3-12100f');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/AMD_Ryzen_5_2600_%2839851733273%29.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'amd-ryzen-5-5600x');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Intel_core_i5-7200u_sr342.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'intel-core-i5-12400f');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/I_Paired_AMD_Ryzen_7_5700x_With_Asus_Prime_A_320M-K_Motherboard.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'amd-ryzen-5-7600x');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Intel_core_i5-3210_sr0mz_observe.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'intel-core-i5-13600k');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/AMD_Ryzen_7_1800X.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'amd-ryzen-7-7700x');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2023_Intel_Core_i7_12700KF_%285%29.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'intel-core-i7-14700k');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/AMD_Ryzen_9_7900X.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'amd-ryzen-9-7900x');

-- ============================================================
-- Motherboards (6)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/A790GXH-128M-Motherboard.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'asrock-b550m-pro4');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asus_ROG_Strix_Z390-H_motherboard.JPG?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'asus-prime-b660m-k-d4');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Supermicro_-_X11SAE_%E2%80%93_CeBIT_2016_01.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'msi-mag-b550-tomahawk');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asus-ROG-Strix-Z390-F-Gaming-Motherboard_20201120_DSC6025.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'msi-pro-z690-a-ddr4');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2023_P%C5%82yta_g%C5%82%C3%B3wna_Asus_ROG_STRIX_Z690-A_GAMING_WIFI.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'gigabyte-b650-gaming-x-ax');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asus-ROG-Strix-Z390-F-Gaming-Motherboard_20201120_DSC6025.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'asus-rog-strix-x670e-f');

-- ============================================================
-- RAM (6)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/16_GiB-DDR4-RAM-Riegel_RAM019FIX_Small_Crop_90_PCNT.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'gskill-ripjaws-v-16gb-ddr4-3200');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/XPG_DDR4_and_MSI_logo_20180606.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'kingston-fury-beast-16gb-ddr4-3200');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2%2A8Go_DDR4_Corsair_-_2018-05-08.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'corsair-vengeance-32gb-ddr4-3600');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/DDR5_SDRAM_IMGP6304_smial_wp.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'gskill-trident-z5-16gb-ddr5-6000');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2023_Pami%C4%99ci_Corsair_Vengeance_RGB.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'corsair-dominator-32gb-ddr5-5600');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/DIMM_IMGP5807_ABCDEF_smial_wp.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'kingston-fury-beast-64gb-ddr4-3200');

-- ============================================================
-- Storage (5)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/256GB_2230_NVME_SSD.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'kingston-nv2-500gb-nvme');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Raspberry-Pi-SSD-Feature_%28cropped%29_512GB_NVMe.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'seagate-barracuda-2tb-hdd');
-- Note: Samsung 980 PRO files que aparecían en búsqueda Wikimedia no resuelven vía
-- Special:FilePath. Usamos imágenes de SSD/NVMe genéricas como alternativa.
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/256GB_2230_NVME_SSD.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'samsung-870-evo-1tb-sata');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ExpressCard_to_M.2_2230_or_2242_NVMe_SSD_adapter_front_and_back_views.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'samsung-970-evo-plus-1tb');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/1TB_2280_NVME_SSD.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'wd-black-sn850x-1tb');

-- ============================================================
-- GPUs (7)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ASUS_TUF_Gaming_X3_20190601.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'nvidia-gtx-1650-4gb');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/MSI_GeForce_RTX_3070_VENTUS_3X_OC.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'amd-rx-7600-8gb');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gigabyte_GeForce_RTX_3090_Eagle_OC_24G%2C_24576_MiB_GDDR6X_Front_20201114_DSC5880.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'nvidia-rtx-3060-12gb');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/RTX_3090_Founders_Edition.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'amd-rx-6700-xt-12gb');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nvidia_GeForce_RTX_5060_Ti_16GB%2C_PNY_Overclocked_Dual_Fan%2C_front.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'nvidia-rtx-4060-8gb');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Zusatz_Palit_GeForce_RTX_5090_20250531_HOF4297_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'nvidia-rtx-3070-ti-8gb');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nvidia_GeForce_RTX_5060_Ti_16GB%2C_PNY_Overclocked_Dual_Fan%2C_rear.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'nvidia-rtx-4070-12gb');

-- ============================================================
-- PSU (4)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ATX_Computer_power_supply_unit.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'corsair-cv550-550w-bronze');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Full_modular_ATX_power_supply_unit.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'evga-650w-gq-gold-semi');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Power_Supply_ATX-450PNF.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'seasonic-focus-gx-750w-gold');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Be_quiet%21_Straight_Power_12_1200W_20240405_HOF1650-HDR_RAW-Export_000105.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'corsair-rm1000x-1000w-gold');

-- ============================================================
-- Cases (4)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ATX_Computer_cases.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'aerocool-cylon-rgb-micro-atx');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ATX_computer_case_-_left_-_2018-05-18.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'nzxt-h510-atx-mid-tower');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Computer_case_-_Full_Tower.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'fractal-design-meshify-2-atx');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ATX_computer_case_-_front_-_2018-05-12.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'lian-li-pc-o11-dynamic');

-- ============================================================
-- Cooling (4)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Prozessorkuehler_komponenten_IMGP5332_wp.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'cooler-master-hyper-212-black');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Alpenf%C3%B6hn_Nordwand_%E2%80%93_CPU_tower_cooler-front_oblique_PNr%C2%B00303.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'be-quiet-dark-rock-4');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cpu_cooler_Supermicro_SNK-P0064AP4_IMGP3440_smial_wp.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'corsair-h100i-rgb-240mm');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/CPU-cooler-14_hg.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'nzxt-kraken-x63-280mm');

-- ============================================================
-- Periféricos
-- ============================================================
-- Mice
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/CM_Storm_Inferno_Gaming_Mouse.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'razer-deathadder-v3-hyperspeed');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Logitech_MX518_Gaming_Mouse_%284777334208%29.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'logitech-g502-x-plus');

-- Keyboards
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Razer_BlackWidow_Ultimate_2014_Elite_Mechanical_Gaming_Keyboard.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'hyperx-alloy-origins-core-tkl');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ROCCAT%E2%84%A2_Ryos_MK_Pro_%E2%80%93_Mechanical_Gaming_Keyboard_%2811947206086%29.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'corsair-k70-rgb-mk2');

-- Webcam
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Webcam_%28Logitech_c922%29.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'logitech-c920-hd-pro-1080p');

-- Headsets
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Afterglow_AGU.1_Wireless_Headphones.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'steelseries-arctis-7p-plus');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Headset_computer.webp?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'hyperx-cloud-alpha-wireless');

-- ============================================================
-- Monitors (6)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ASUS_VS229NR_at_Platform_2%2C_TRA_Baifu_Station_20231209_night.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'aoc-24g2-24-ips');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ASUS_VS229NR_at_Platform_2%2C_TRA_Baifu_Station_20231210.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'asus-tuf-vg249-24-fhd');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/LGETT_25UM65-P_rear_on_the_table_20221224.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'samsung-odyssey-g5-27-qhd');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/NEC_MONITOR_E2206XG.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'lg-ultragear-27gn800');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/TR_ED9461_and_ASUS_VS229NR_at_Baifu_Station_20251103_T1734.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'msi-mag-322cqr-32');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ASUS_VS229NR_at_Platform_2%2C_TR_Baifu_Station_20240101.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'samsung-viewfinity-27-4k');

-- ============================================================
-- Laptops (4)
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/MSI_Gaming_Laptop_on_wood_floor.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'lenovo-ideapad-gaming-3-r5');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Falcon_Northwest%27s_TLX_gaming_laptop.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'msi-thin-gf63-i5-rtx2050');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/HP_Victus_15_gaming_laptop_side_view.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'asus-rog-strix-g15-r9-rtx4060');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Samsung_Notebook_Odyssey_2017.jpg?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'msi-raider-ge68-i9-rtx4080');

-- ============================================================
-- PCs Prebuilt JB (5) — fotos reales de gaming PCs RGB
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2493-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-bronze-edition');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2505-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-silver-edition');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2511-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-gold-edition');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2520-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-workstation-pro');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2508-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-ruby-gaming');

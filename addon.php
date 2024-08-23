<?php
/**
 * Plugin Name:       Addon
 * Description:       An addon plugin for Acadlix
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Harshit
 * Text Domain:       acadlix
 */

add_action('admin_menu', 'docx_viewer_fn');

function docx_viewer_fn() {   
    add_menu_page(
        'Add DOC',
        'Addon',
        'manage_options',
        'docx_select',
        'docx_select_callback', 
        'dashicons-admin-post' 
    );
}

function docx_select_callback() {
    echo '<div id="addon">hello 2</div>';
}

add_action('admin_enqueue_scripts', 'addon_scripts');

function addon_scripts() {
    $dependencies = require_once __DIR__ . '/build/index.asset.php';
    $data = [
        'src'     => plugins_url('build/index.js', __FILE__),
        'version' => $dependencies['version'],
        'deps'    => $dependencies['dependencies'],
    ];

    
    wp_enqueue_script('addon-script', $data['src'], $data['deps'], $data['version'], true); 
}

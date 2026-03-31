#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const LOCALES_DIR = path.join(__dirname, '../src/locales')

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
}

function loadJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(content)
    } catch (error) {
        console.error(`${colors.red}✗ Error loading ${filePath}: ${error.message}${colors.reset}`)
        return null
    }
}

function countKeys(obj) {
    let count = 0
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            count += countKeys(obj[key])
        } else {
            count++
        }
    }
    return count
}

function checkTranslations() {
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`)
    console.log(`${colors.blue}  🌍  TRANSLATION CHECKER${colors.reset}`)
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`)
    
    const languages = ['en', 'ru', 'pl', 'ua']
    const baseLang = 'en'
    
    // Count base keys
    const baseTranslation = loadJSON(path.join(LOCALES_DIR, baseLang, 'translation.json'))
    const baseKeys = baseTranslation ? countKeys(baseTranslation) : 0
    
    console.log(`${colors.yellow}Base Language: ${baseLang} (${baseKeys} keys)${colors.reset}\n`)
    
    languages.forEach(lang => {
        if (lang === baseLang) return
        
        const translation = loadJSON(path.join(LOCALES_DIR, lang, 'translation.json'))
        const targetKeys = translation ? countKeys(translation) : 0
        const missing = baseKeys - targetKeys
        const percentage = Math.round((targetKeys / baseKeys) * 100)
        
        const status = missing === 0 
            ? `${colors.green}✓ Complete (${percentage}%)${colors.reset}`
            : `${colors.yellow}✗ Missing ${missing} keys (${percentage}%)${colors.reset}`
        
        console.log(`${colors.blue}${lang.toUpperCase()}:${colors.reset}`)
        console.log(`  Base keys: ${baseKeys}`)
        console.log(`  Target keys: ${targetKeys}`)
        console.log(`  Status: ${status}`)
        console.log()
    })
    
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`)
}

checkTranslations()

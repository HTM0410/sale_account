#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Files that need Suspense wrapper for useSearchParams
const filesToFix = [
  'components/ProductFilters.tsx',
  'components/Pagination.tsx', 
  'components/admin/ProductsHeader.tsx',
  'components/admin/OrdersHeader.tsx',
  'components/admin/UsersHeader.tsx'
]

function wrapWithSuspense(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      return false
    }

    let content = fs.readFileSync(fullPath, 'utf8')
    
    // Check if already wrapped
    if (content.includes('export default function') && content.includes('Suspense')) {
      console.log(`✅ ${filePath} already has Suspense`)
      return true
    }

    // Add Suspense import if not present
    if (!content.includes('import { Suspense }')) {
      if (content.includes("from 'react'")) {
        content = content.replace(
          /import { ([^}]+) } from 'react'/,
          "import { $1, Suspense } from 'react'"
        )
      } else {
        content = "import { Suspense } from 'react'\n" + content
      }
    }

    // Find the main export function
    const exportMatch = content.match(/export default function (\w+)\([^)]*\) \{/)
    if (!exportMatch) {
      console.log(`⚠️  Could not find export function in ${filePath}`)
      return false
    }

    const functionName = exportMatch[1]
    const originalFunctionName = functionName + 'Content'

    // Rename the original function
    content = content.replace(
      `export default function ${functionName}`,
      `function ${originalFunctionName}`
    )

    // Add new wrapper function
    const wrapperFunction = `
export default function ${functionName}(props: any) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>}>
      <${originalFunctionName} {...props} />
    </Suspense>
  )
}`

    content += wrapperFunction

    fs.writeFileSync(fullPath, content)
    console.log(`✅ Fixed ${filePath}`)
    return true

  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message)
    return false
  }
}

function main() {
  console.log('🔧 Fixing useSearchParams Suspense issues...\n')
  
  let fixed = 0
  let total = filesToFix.length

  filesToFix.forEach(file => {
    if (wrapWithSuspense(file)) {
      fixed++
    }
  })

  console.log(`\n📊 Summary: ${fixed}/${total} files fixed`)
  
  if (fixed === total) {
    console.log('✅ All files fixed successfully!')
  } else {
    console.log('⚠️  Some files could not be fixed. Please check manually.')
  }
}

if (require.main === module) {
  main()
}

module.exports = { wrapWithSuspense }

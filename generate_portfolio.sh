#!/bin/bash
# Regenerate portfolio.json correctly - iterate full files, find matching thumb

BASE="/opt/data/dollar-nong-photography"
JSON_FILE="$BASE/data/portfolio.json"

cat > "$JSON_FILE" << 'HEADER'
{
    "images": {
HEADER

first_cat=true
id_counter=0

for category in portrait event food; do
  full_dir="$BASE/images/$category/full"
  thumbs_dir="$BASE/images/$category/thumbs"
  
  if [ ! -d "$full_dir" ]; then
    continue
  fi
  
  # Start category array
  if [ "$first_cat" = false ]; then
    printf '        ,\n' >> "$JSON_FILE"
  fi
  first_cat=false
  
  printf '        "%s": [\n' "$category" >> "$JSON_FILE"
  
  first_item=true
  
  # Collect full files, sorted
  full_files=()
  for f in "$full_dir"/*; do
    [ -f "$f" ] || continue
    full_files+=("$f")
  done
  IFS=$'\n' full_files=($(sort <<<"${full_files[*]}"))
  unset IFS
  
  for full_file in "${full_files[@]}"; do
    full_base=$(basename "$full_file")
    full_name="${full_base%.*}"
    
    # Find matching thumb - try exact match first, then alternate extension
    thumb_file=""
    if [ -f "$thumbs_dir/$full_base" ]; then
      thumb_file="$thumbs_dir/$full_base"
    else
      # Try .jpg if full is .png, and vice versa
      if [[ "$full_base" == *.png ]] || [[ "$full_base" == *.PNG ]]; then
        if [ -f "$thumbs_dir/${full_name}.jpg" ]; then
          thumb_file="$thumbs_dir/${full_name}.jpg"
        elif [ -f "$thumbs_dir/${full_name}.JPG" ]; then
          thumb_file="$thumbs_dir/${full_name}.JPG"
        fi
      elif [[ "$full_base" == *.jpg ]] || [[ "$full_base" == *.JPG ]]; then
        if [ -f "$thumbs_dir/${full_name}.png" ]; then
          thumb_file="$thumbs_dir/${full_name}.png"
        elif [ -f "$thumbs_dir/${full_name}.PNG" ]; then
          thumb_file="$thumbs_dir/${full_name}.PNG"
        fi
      fi
    fi
    
    # Skip if no thumb found
    [ -n "$thumb_file" ] || continue
    
    thumb_base=$(basename "$thumb_file")
    id_counter=$((id_counter + 1))
    
    if [ "$first_item" = false ]; then
      printf '            ,\n' >> "$JSON_FILE"
    fi
    first_item=false
    
    cat >> "$JSON_FILE" << ITEM
            {
                "id": "${category}_${id_counter}",
                "title": "${full_name}",
                "full": "/images/${category}/full/${full_base}",
                "thumb": "/images/${category}/thumbs/${thumb_base}",
                "category": "${category}",
                "hidden": false
            }
ITEM
  done
  
  printf '        ]\n' >> "$JSON_FILE"
done

echo "    }" >> "$JSON_FILE"
echo "}" >> "$JSON_FILE"

echo "Generated portfolio.json with $id_counter images"

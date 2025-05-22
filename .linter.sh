#!/bin/bash
cd /home/kavia/workspace/code-generation/frogcross-arcade-94191-94215/main_container_for_frogcross_arcade
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


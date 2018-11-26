#!/bin/bash
# Add the following line to cron job
# crontab -e
# ADD THIS -> */15 * * * * cron_delete_temp.sh
rm -rf /usr/cs/2018/agaudrea/Documents/fastack/public/temp/*
